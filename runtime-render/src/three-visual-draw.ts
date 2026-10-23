import { BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, ExternalTexture,
  DoubleSide, NormalBlending, SRGBColorSpace, LinearSRGBColorSpace, type Object3D } from 'three';
import { textureBacking, type RenderTexture, type RenderTextureSnapshot } from './render-texture.js';
import type { VisualFrameItem } from './visual-transform-backend.js';
import { FrameError } from './frame-failure.js';

/** Owned by the existing Three backend. Borrows Phase7 native allocations through
 * public Three ExternalTexture; never uploads, deletes, or releases those allocations. */
export function createVisualDrawScope(nodes: Map<object, Object3D>,
  resolve: (texture: RenderTexture) => { native: WebGLTexture; snapshot: RenderTextureSnapshot }) {
  interface Borrow { readonly texture: ExternalTexture; refs: number }
  interface Drawable {
    readonly mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
    readonly item: VisualFrameItem;
    readonly backing: RenderTexture;
    readonly borrow: Borrow;
  }
  const borrowed = new Map<RenderTexture, Borrow>();
  const drawables = new Map<object, Drawable>();
  const releaseBorrow = (backing: RenderTexture, borrow: Borrow): void => {
    if (--borrow.refs !== 0) return;
    borrowed.delete(backing);
    borrow.texture.sourceTexture = null;
    borrow.texture.dispose(); // r186 ExternalTexture has no native upload/deletion ownership.
  };
  const destroy = (drawable: Drawable): void => {
    let failed = false;
    for (const action of [() => drawable.mesh.removeFromParent(), () => drawable.mesh.geometry.dispose(),
      () => drawable.mesh.material.dispose(), () => releaseBorrow(drawable.backing, drawable.borrow)]) {
      try { action(); } catch { failed = true; }
    }
    if (failed) throw new FrameError('CLEANUP_FAILED', 'dispose', true);
  };
  const remove = (instance: object): void => {
    const previous = drawables.get(instance);
    drawables.delete(instance); // Unlink before potentially throwing cleanup.
    if (previous !== undefined) destroy(previous);
  };
  const create = (item: VisualFrameItem, backing: RenderTexture,
    native: WebGLTexture, snapshot: RenderTextureSnapshot): Drawable => {
    let borrow = borrowed.get(backing);
    if (borrow === undefined) {
      const texture = new ExternalTexture(native);
      texture.colorSpace = snapshot.options.colorSpace === 'srgb' ? SRGBColorSpace : LinearSRGBColorSpace;
      borrow = { texture, refs: 0 }; borrowed.set(backing, borrow);
    }
    borrow.refs += 1;
    let geometry: BufferGeometry | undefined;
    let material: MeshBasicMaterial | undefined;
    try {
      const { x, y, width, height } = item.layout, axes = item.transform.placement.plane.axes;
      const right = x + (axes.x === 'right' ? width : -width);
      const bottom = y + (axes.y === 'down' ? height : -height);
      const uv = item.frame?.uv ?? { left: 0, top: 0, right: 1, bottom: 1 };
      geometry = new BufferGeometry();
      geometry.setAttribute('position', new Float32BufferAttribute([
        x, y, 0, right, y, 0, right, bottom, 0, x, bottom, 0,
      ], 3));
      geometry.setAttribute('uv', new Float32BufferAttribute([
        uv.left, uv.top, uv.right, uv.top, uv.right, uv.bottom, uv.left, uv.bottom,
      ], 2));
      geometry.setIndex([0, 1, 2, 0, 2, 3]);
      material = new MeshBasicMaterial({ map: borrow.texture, transparent: true,
        blending: NormalBlending, premultipliedAlpha: false, depthTest: false, depthWrite: false,
        side: DoubleSide, toneMapped: false, fog: false });
      material.forceSinglePass = true; // Reflections/axes supported without a second transparent pass.
      const mesh = new Mesh(geometry, material);
      mesh.matrixAutoUpdate = false;
      mesh.frustumCulled = false; // Fixed planar MVP; no inferred camera/culling policy.
      return { mesh, item, backing, borrow };
    } catch (error) {
      let cleanupFailed = false;
      try { geometry?.dispose(); } catch { cleanupFailed = true; }
      try { material?.dispose(); } catch { cleanupFailed = true; }
      try { releaseBorrow(backing, borrow); } catch { cleanupFailed = true; }
      if (cleanupFailed) throw new FrameError('FRAME_FAILED', 'renderFrame', true);
      throw error;
    }
  };
  return {
    remove,
    synchronize: (items: readonly VisualFrameItem[]): void => {
      const active = new Set(items.map(item => item.instance));
      for (const instance of drawables.keys()) if (!active.has(instance)) remove(instance);
      for (const item of items) {
        const matrix = item.transform.localToClip;
        if (![matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty]
          .every(value => Number.isFinite(Math.fround(value)))) throw new FrameError('FRAME_FAILED', 'renderFrame');
        const { native, snapshot } = resolve(item.texture); // Revalidate every submitted right, including reused meshes.
        const backing = textureBacking(item.texture);
        const parent = nodes.get(item.instance);
        if (backing === undefined || parent === undefined) throw new FrameError('FRAME_FAILED', 'renderFrame');
        let current = drawables.get(item.instance);
        const axes = item.transform.placement.plane.axes;
        if (current === undefined || current.backing !== backing || current.item.layout !== item.layout
          || current.item.frame !== item.frame || current.item.transform.placement.plane.axes.x !== axes.x
          || current.item.transform.placement.plane.axes.y !== axes.y) {
          const replacement = create(item, backing, native, snapshot);
          // Track replacement before old cleanup; terminal disposal drains partial reconciliation.
          drawables.set(item.instance, replacement);
          if (current !== undefined) destroy(current);
          current = replacement;
          parent.add(current.mesh);
        }
        // Rank actual drawable; ordinary Object3D parent renderOrder is not inherited.
        current.mesh.renderOrder = item.renderOrder;
        current.mesh.visible = true;
      }
    },
    dispose: (): void => {
      let failed = false;
      for (const instance of [...drawables.keys()]) try { remove(instance); } catch { failed = true; }
      if (failed) throw new FrameError('CLEANUP_FAILED', 'dispose', true);
    },
  };
}
