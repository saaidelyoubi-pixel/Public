/* Youbi Key Solutions — Three.js hero scene
   A procedural 3D car key fob floating in a particle field.
   Exposes window.MKScene = { setScroll(progress) } for main.js. */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var canvas = document.getElementById("keyCanvas");
    if (!canvas || typeof THREE === "undefined") return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    } catch (e) {
      canvas.style.display = "none";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    // light "golden hour" scene: warm ivory fog so depth fades into the page
    scene.fog = new THREE.FogExp2(0xf7f4ec, 0.05);

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0xfff4e0, 1.15));
    var keyLight = new THREE.PointLight(0xffab00, 1.8, 40);
    keyLight.position.set(5, 4, 6);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);
    var roam = new THREE.PointLight(0xff7a00, 1.1, 25);
    roam.position.set(-4, -2, 4);
    scene.add(roam);

    /* ── key group ── */
    var key = new THREE.Group();

    function roundedRectShape(w, h, r) {
      var s = new THREE.Shape();
      s.moveTo(-w / 2 + r, -h / 2);
      s.lineTo(w / 2 - r, -h / 2);
      s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      s.lineTo(w / 2, h / 2 - r);
      s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      s.lineTo(-w / 2 + r, h / 2);
      s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      s.lineTo(-w / 2, -h / 2 + r);
      s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      return s;
    }

    /* VW-style flip key (like the reference photo): angular black body
       with chrome side trim, three stacked buttons, top screw emblem,
       LED and a folded-out chrome blade */
    var bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0b0d, metalness: 0.3, roughness: 0.35,
      clearcoat: 0.8, clearcoatRoughness: 0.25
    });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e4e8, metalness: 1.0, roughness: 0.12 });
    var btnMat = new THREE.MeshStandardMaterial({ color: 0x17181c, metalness: 0.5, roughness: 0.45 });
    var iconMat = new THREE.MeshStandardMaterial({ color: 0xd8dadd, metalness: 0.1, roughness: 0.5 });
    var amberMat = new THREE.MeshStandardMaterial({ color: 0xffab00, emissive: 0xff8a00, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.3 });

    function extrude(shape, depth, bevel) {
      var g = new THREE.ExtrudeGeometry(shape, {
        depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
        bevelSegments: 3, curveSegments: 20
      });
      g.center();
      return g;
    }

    // angular slab body (small corner radius = crisp edges)
    key.add(new THREE.Mesh(extrude(roundedRectShape(1.95, 3.7, 0.32), 0.55, 0.1), bodyMat));

    // chrome side trim band
    var band = new THREE.Mesh(extrude(roundedRectShape(2.03, 3.78, 0.34), 0.12, 0.02), chromeMat);
    key.add(band);

    // three stacked buttons (lock / trunk / unlock) with light icon plates
    function keyButton(y) {
      var b = new THREE.Mesh(extrude(roundedRectShape(1.15, 0.52, 0.2), 0.05, 0.02), btnMat);
      b.position.set(0, y, 0.42);
      key.add(b);
      var icon = new THREE.Mesh(extrude(roundedRectShape(0.26, 0.22, 0.07), 0.02, 0.008), iconMat);
      icon.position.set(0, y, 0.47);
      key.add(icon);
    }
    keyButton(0.45);
    keyButton(-0.18);
    keyButton(-0.81);

    // top screw emblem (chrome ring, dark core, slot)
    var screwRing = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 32), chromeMat);
    screwRing.rotation.x = Math.PI / 2;
    screwRing.position.set(0, 1.38, 0.29);
    key.add(screwRing);
    var screwCore = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 32), btnMat);
    screwCore.rotation.x = Math.PI / 2;
    screwCore.position.set(0, 1.38, 0.32);
    key.add(screwCore);
    var slot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.02), chromeMat);
    slot.position.set(0, 1.38, 0.35);
    slot.rotation.z = 0.5;
    key.add(slot);

    // status LED (small amber accent, like the photo's indicator dot)
    var led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), amberMat);
    led.position.set(0.6, 1.05, 0.4);
    key.add(led);

    // keyring loop at the top corner
    var lanyard = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 12, 30), chromeMat);
    lanyard.position.set(-0.72, 2.0, 0);
    key.add(lanyard);

    // folded-out chrome flip blade at the bottom
    var bladeGroup = new THREE.Group();
    var blade = new THREE.Mesh(extrude(roundedRectShape(0.36, 1.85, 0.14), 0.09, 0.02), chromeMat);
    blade.position.y = -0.85;
    bladeGroup.add(blade);
    var groove = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.02), btnMat);
    groove.position.set(0.05, -0.8, 0.06);
    bladeGroup.add(groove);
    bladeGroup.position.set(0.45, -1.72, -0.02);
    bladeGroup.rotation.z = -0.55;
    key.add(bladeGroup);
    // pivot cap where the blade folds out
    var pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.62, 24), chromeMat);
    pivot.rotation.x = Math.PI / 2;
    pivot.position.set(0.45, -1.72, 0);
    key.add(pivot);

    key.rotation.set(0.35, -0.55, -0.12);
    scene.add(key);

    /* ── particles ── */
    var COUNT = 700;
    var positions = new Float32Array(COUNT * 3);
    var speeds = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
      speeds[i] = 0.15 + Math.random() * 0.55;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // additive blending disappears on a light page — use normal blending
    // with a deep amber so the dust reads as warm specks
    var pMat = new THREE.PointsMaterial({
      color: 0xff8a00, size: 0.055, transparent: true, opacity: 0.5,
      depthWrite: false
    });
    scene.add(new THREE.Points(pGeo, pMat));

    /* ── layout: key sits right of center on wide screens ── */
    var keyTargetX = 3.2, keyBaseY = 0, keyBaseZ = 0;
    function layout() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (w < 700) { keyTargetX = 1.9; keyBaseY = 3.2; keyBaseZ = -2.6; key.scale.setScalar(0.55); }
      else if (w < 1100) { keyTargetX = 2.2; keyBaseY = 0; keyBaseZ = 0; key.scale.setScalar(0.85); }
      else { keyTargetX = 3.4; keyBaseY = 0; keyBaseZ = 0; key.scale.setScalar(1); }
      key.position.set(keyTargetX, keyBaseY, keyBaseZ);
    }
    layout();
    window.addEventListener("resize", layout);

    /* ── interaction state ── */
    var mouseX = 0, mouseY = 0, scrollP = 0;
    window.addEventListener("pointermove", function (e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    window.MKScene = {
      setScroll: function (p) { scrollP = p; }
    };

    /* ── loop ── */
    var clock = new THREE.Clock();
    var running = true;
    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) loop();
    });

    function loop() {
      if (!running) return;
      requestAnimationFrame(loop);
      var t = clock.getElapsedTime();

      if (!reduced) {
        key.position.y += (Math.sin(t * 0.8) * 0.25 + keyBaseY - key.position.y) * 0.06;
        var targetRotY = -0.55 + mouseX * 0.35 + scrollP * 2.4;
        var targetRotX = 0.35 + mouseY * 0.22 + scrollP * 0.5;
        key.rotation.y += (targetRotY - key.rotation.y) * 0.05;
        key.rotation.x += (targetRotX - key.rotation.x) * 0.05;
        key.rotation.z = -0.12 + Math.sin(t * 0.5) * 0.05;

        roam.position.x = Math.sin(t * 0.6) * 6;
        roam.position.y = Math.cos(t * 0.45) * 4;

        var pos = pGeo.attributes.position.array;
        for (var i = 0; i < COUNT; i++) {
          pos[i * 3 + 1] += speeds[i] * 0.012;
          if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = -10;
        }
        pGeo.attributes.position.needsUpdate = true;

        // subtle camera parallax
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.04;
        camera.lookAt(keyTargetX * 0.45, 0, 0);
      }

      // key fades back as you scroll past hero
      key.position.z = keyBaseZ - scrollP * 6;
      pMat.opacity = 0.5 * (1 - scrollP * 0.8);

      renderer.render(scene, camera);
    }
    loop();
  });
})();
