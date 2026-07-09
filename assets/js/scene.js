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

    /* modern keyless smart key: glossy pebble body, chrome side band,
       flush buttons, glowing emblem + LED — no exposed blade */
    var bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0e0f13, metalness: 0.35, roughness: 0.22,
      clearcoat: 1.0, clearcoatRoughness: 0.12
    });
    var chromeMat = new THREE.MeshStandardMaterial({ color: 0xd9dbe0, metalness: 1.0, roughness: 0.15 });
    var btnMat = new THREE.MeshStandardMaterial({ color: 0x23252c, metalness: 0.6, roughness: 0.42 });
    var amberMat = new THREE.MeshStandardMaterial({ color: 0xffab00, emissive: 0xff8a00, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.3 });

    function extrude(shape, depth, bevel) {
      var g = new THREE.ExtrudeGeometry(shape, {
        depth: depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
        bevelSegments: 4, curveSegments: 28
      });
      g.center();
      return g;
    }

    // pebble body
    key.add(new THREE.Mesh(extrude(roundedRectShape(1.9, 3.6, 0.9), 0.5, 0.18), bodyMat));

    // chrome band around the edge
    var band = new THREE.Mesh(extrude(roundedRectShape(1.98, 3.68, 0.94), 0.1, 0.03), chromeMat);
    key.add(band);

    // flush pill buttons (unlock / lock) + round trunk button
    function pill(y) {
      var m = new THREE.Mesh(extrude(roundedRectShape(0.72, 0.34, 0.17), 0.05, 0.02), btnMat);
      m.position.set(0, y, 0.42);
      return m;
    }
    key.add(pill(0.55));
    key.add(pill(0.05));
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 28), btnMat);
    trunk.rotation.x = Math.PI / 2;
    trunk.position.set(0, -0.5, 0.44);
    key.add(trunk);

    // brand emblem: glowing amber ring with dark centre
    var emblem = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 14, 36), amberMat);
    emblem.position.set(0, 1.18, 0.42);
    key.add(emblem);
    var emblemCore = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 28), btnMat);
    emblemCore.rotation.x = Math.PI / 2;
    emblemCore.position.set(0, 1.18, 0.4);
    key.add(emblemCore);

    // status LED
    var led = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), amberMat);
    led.position.set(0.55, -1.15, 0.42);
    key.add(led);

    // slim chrome lanyard loop, half-embedded at the bottom
    var lanyard = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 30), chromeMat);
    lanyard.position.set(0, -1.98, 0);
    key.add(lanyard);

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
