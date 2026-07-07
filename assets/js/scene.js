/* YOUBIKEYCAR — Three.js hero scene
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
    scene.fog = new THREE.FogExp2(0x0b0b0d, 0.045);

    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 11);

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0x404048, 0.7));
    var keyLight = new THREE.PointLight(0xffb700, 1.6, 40);
    keyLight.position.set(5, 4, 6);
    scene.add(keyLight);
    var rimLight = new THREE.DirectionalLight(0x8899ff, 0.7);
    rimLight.position.set(-6, 3, -4);
    scene.add(rimLight);
    var roam = new THREE.PointLight(0xff8a00, 0.9, 25);
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

    var bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1b21, metalness: 0.85, roughness: 0.32 });
    var darkMat = new THREE.MeshStandardMaterial({ color: 0x101014, metalness: 0.7, roughness: 0.45 });
    var amberMat = new THREE.MeshStandardMaterial({ color: 0xffb700, emissive: 0xff8a00, emissiveIntensity: 0.55, metalness: 0.4, roughness: 0.3 });
    var steelMat = new THREE.MeshStandardMaterial({ color: 0xc8c6bd, metalness: 1.0, roughness: 0.25 });

    // fob body
    var fobGeo = new THREE.ExtrudeGeometry(roundedRectShape(2.1, 3.1, 0.75), {
      depth: 0.5, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.14, bevelSegments: 4, curveSegments: 24
    });
    fobGeo.center();
    key.add(new THREE.Mesh(fobGeo, bodyMat));

    // face plate
    var plateGeo = new THREE.ExtrudeGeometry(roundedRectShape(1.7, 2.6, 0.6), {
      depth: 0.06, bevelEnabled: false, curveSegments: 24
    });
    plateGeo.center();
    var plate = new THREE.Mesh(plateGeo, darkMat);
    plate.position.z = 0.42;
    key.add(plate);

    // buttons: unlock (amber, glowing), lock, trunk
    function button(y, mat, r) {
      var b = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 28), mat);
      b.rotation.x = Math.PI / 2;
      b.position.set(0, y, 0.52);
      return b;
    }
    key.add(button(0.75, amberMat, 0.34));
    key.add(button(0.0, bodyMat, 0.3));
    key.add(button(-0.7, bodyMat, 0.26));

    // key ring
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.09, 16, 40), steelMat);
    ring.position.set(0, 1.95, 0);
    key.add(ring);

    // blade (folded out to the side)
    var bladeShape = new THREE.Shape();
    bladeShape.moveTo(0, -0.13);
    bladeShape.lineTo(2.0, -0.13);
    bladeShape.lineTo(2.0, 0.02);
    bladeShape.lineTo(1.78, 0.02); bladeShape.lineTo(1.72, 0.13);
    bladeShape.lineTo(1.5, 0.02); bladeShape.lineTo(1.34, 0.13);
    bladeShape.lineTo(1.18, 0.02); bladeShape.lineTo(1.0, 0.13);
    bladeShape.lineTo(0.88, 0.02); bladeShape.lineTo(0, 0.02);
    bladeShape.closePath();
    var bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.1, bevelEnabled: false });
    var blade = new THREE.Mesh(bladeGeo, steelMat);
    blade.position.set(0.9, -1.05, -0.05);
    blade.rotation.z = -0.5;
    key.add(blade);

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
    var pMat = new THREE.PointsMaterial({
      color: 0xffb700, size: 0.045, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false
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
      pMat.opacity = 0.6 * (1 - scrollP * 0.8);

      renderer.render(scene, camera);
    }
    loop();
  });
})();
