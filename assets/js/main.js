import * as THREE from 'three';

import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import {
    FBXLoader
} from 'three/addons/loaders/FBXLoader.js';


// ============================================================
// ESCENA
// ============================================================

const scene =
    new THREE.Scene();


const BACKGROUND_COLOR =
    0x050913;


scene.background =
    new THREE.Color(
        BACKGROUND_COLOR
    );


// ============================================================
// NIEBLA
// ============================================================

scene.fog =
    new THREE.FogExp2(
        0x0a1020,
        0.012
    );


// ============================================================
// CÁMARA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        50,

        window.innerWidth /
        window.innerHeight,

        0.1,

        1000

    );


camera.position.set(
    5,
    3.5,
    7
);


// ============================================================
// RENDERIZADOR
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true

    });


renderer.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        2
    )

);


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.shadowMap.enabled =
    true;


renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.0;


document
    .getElementById('scene-container')
    .appendChild(renderer.domElement);


// ============================================================
// CONTROLES DE CÁMARA
// ============================================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );


controls.enableDamping =
    true;


controls.dampingFactor =
    0.06;


controls.target.set(
    0,
    1,
    0
);


controls.maxPolarAngle =
    Math.PI * 0.48;


controls.minDistance =
    3;


controls.maxDistance =
    15;


// ============================================================
// CIELO NINJA PROCEDURAL
// ============================================================

function createNinjaSky() {

    const canvas =
        document.createElement('canvas');


    canvas.width = 2048;
    canvas.height = 1024;

    const ctx =
        canvas.getContext('2d');


    // ========================================================
    // CIELO AZUL-NEGRO
    // ========================================================

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );


    gradient.addColorStop(0.00, '#02040a');
    gradient.addColorStop(0.18, '#050913');
    gradient.addColorStop(0.42, '#0a1223');
    gradient.addColorStop(0.68, '#131f35');
    gradient.addColorStop(0.86, '#0d1729');
    gradient.addColorStop(1.00, '#060b14');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // ========================================================
    // ESTRELLAS SUAVES
    // ========================================================

    for (let i = 0; i < 280; i++) {

        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height * 0.72);
        const r = Math.random() * 1.4 + 0.2;
        const alpha = 0.18 + Math.random() * 0.45;

        ctx.beginPath();
        ctx.fillStyle = `rgba(210, 225, 255, ${alpha})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }


    // ========================================================
    // LUNA LLENA ENORME
    // ========================================================

    const moonX =
        canvas.width * 0.53;

    const moonY =
        canvas.height * 0.30;

    const moonGlow =
        ctx.createRadialGradient(
            moonX,
            moonY,
            20,
            moonX,
            moonY,
            250
        );


    moonGlow.addColorStop(0, 'rgba(245, 248, 255, 0.95)');
    moonGlow.addColorStop(0.28, 'rgba(200, 220, 255, 0.35)');
    moonGlow.addColorStop(0.60, 'rgba(140, 170, 255, 0.12)');
    moonGlow.addColorStop(1, 'rgba(140, 170, 255, 0.0)');

    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 250, 0, Math.PI * 2);
    ctx.fill();


    ctx.beginPath();
    ctx.fillStyle = '#eef3ff';
    ctx.arc(moonX, moonY, 105, 0, Math.PI * 2);
    ctx.fill();


    // sombras suaves / cráteres
    ctx.fillStyle = 'rgba(185, 198, 218, 0.35)';

    const craters = [
        [moonX - 30, moonY - 10, 16],
        [moonX + 24, moonY + 10, 12],
        [moonX - 5, moonY + 30, 10],
        [moonX + 35, moonY - 28, 8],
        [moonX - 42, moonY + 35, 9]
    ];

    craters.forEach(([x, y, r]) => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    });


    // ========================================================
    // NUBES NOCTURNAS
    // ========================================================

    for (let i = 0; i < 24; i++) {

        const x = Math.random() * canvas.width;
        const y = canvas.height * (0.14 + Math.random() * 0.40);
        const w = 140 + Math.random() * 320;
        const h = 18 + Math.random() * 42;

        ctx.fillStyle =
            `rgba(38, 52, 82, ${0.10 + Math.random() * 0.08})`;

        ctx.beginPath();
        ctx.ellipse(
            x,
            y,
            w,
            h,
            0,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }


    // nube frente a la luna para dar dramatismo
    for (let i = 0; i < 7; i++) {

        const x = moonX - 180 + i * 55;
        const y = moonY + 10 + Math.sin(i * 0.8) * 10;
        const w = 80 + Math.random() * 40;
        const h = 20 + Math.random() * 10;

        ctx.fillStyle = 'rgba(42, 56, 86, 0.18)';
        ctx.beginPath();
        ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
        ctx.fill();
    }


    // ========================================================
    // MONTAÑAS LEJANAS
    // ========================================================

    ctx.fillStyle = '#0a0e16';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.77);

    for (let x = 0; x <= canvas.width; x += 120) {

        const peak =
            canvas.height * (0.60 + Math.random() * 0.10);

        ctx.lineTo(x + 60, peak);
        ctx.lineTo(x + 120, canvas.height * 0.77);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();


    // ========================================================
    // COLINAS CERCANAS
    // ========================================================

    ctx.fillStyle = '#04060c';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.84);

    for (let x = 0; x <= canvas.width; x += 95) {

        const peak =
            canvas.height * (0.70 + Math.random() * 0.08);

        ctx.lineTo(x + 48, peak);
        ctx.lineTo(x + 95, canvas.height * 0.84);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();


    // ========================================================
    // TORII EN SILUETA
    // ========================================================

    const toriiX =
        canvas.width * 0.72;

    const toriiY =
        canvas.height * 0.79;

    ctx.fillStyle = '#020305';

    ctx.fillRect(toriiX - 50, toriiY - 100, 12, 105);
    ctx.fillRect(toriiX + 38, toriiY - 100, 12, 105);
    ctx.fillRect(toriiX - 78, toriiY - 104, 156, 10);
    ctx.fillRect(toriiX - 92, toriiY - 122, 184, 12);


    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    return texture;
}


// ============================================================
// DOMO DEL CIELO
// ============================================================

const ninjaSky =
    createNinjaSky();


const skyDome =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            400,
            48,
            32
        ),

        new THREE.MeshBasicMaterial({

            map: ninjaSky,
            side: THREE.BackSide,
            fog: false

        })

    );


scene.add(skyDome);


// ============================================================
// TEXTURA PROCEDURAL DEL PISO
// ============================================================

function createGroundTexture() {

    const canvas =
        document.createElement('canvas');


    canvas.width = 1024;
    canvas.height = 1024;

    const ctx =
        canvas.getContext('2d');


    // ========================================================
    // BASE OSCURA
    // ========================================================

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    gradient.addColorStop(0, '#16181e');
    gradient.addColorStop(0.5, '#23262d');
    gradient.addColorStop(1, '#15181d');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // ========================================================
    // GRANULADO
    // ========================================================

    for (let i = 0; i < 9000; i++) {

        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 1 + Math.random() * 3.5;
        const value = 30 + Math.floor(Math.random() * 50);
        const alpha = 0.03 + Math.random() * 0.10;

        ctx.fillStyle =
            `rgba(${value}, ${value + 4}, ${value + 8}, ${alpha})`;

        ctx.fillRect(x, y, size, size);
    }


    // ========================================================
    // PIEDRAS
    // ========================================================

    for (let i = 0; i < 90; i++) {

        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const rx = 3 + Math.random() * 9;
        const ry = 2 + Math.random() * 5;

        ctx.fillStyle =
            `rgba(70, 76, 86, ${0.15 + Math.random() * 0.25})`;

        ctx.beginPath();
        ctx.ellipse(
            x,
            y,
            rx,
            ry,
            Math.random() * Math.PI,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }


    // ========================================================
    // SURCOS SUAVES
    // ========================================================

    ctx.lineWidth = 1.1;

    for (let y = 0; y < canvas.height; y += 22) {

        ctx.strokeStyle =
            'rgba(120, 140, 180, 0.045)';

        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 12) {

            const wave =
                Math.sin((x * 0.018) + (y * 0.022)) * 2.3;

            if (x === 0) {
                ctx.moveTo(x, y + wave);
            } else {
                ctx.lineTo(x, y + wave);
            }
        }

        ctx.stroke();
    }


    const texture =
        new THREE.CanvasTexture(canvas);

    texture.wrapS =
        THREE.RepeatWrapping;

    texture.wrapT =
        THREE.RepeatWrapping;

    texture.repeat.set(40, 40);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    texture.anisotropy =
        renderer.capabilities.getMaxAnisotropy();

    return texture;
}


// ============================================================
// BUMP DEL PISO
// ============================================================

function createGroundBump() {

    const canvas =
        document.createElement('canvas');


    canvas.width = 512;
    canvas.height = 512;

    const ctx =
        canvas.getContext('2d');


    ctx.fillStyle = '#777777';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 12000; i++) {

        const value =
            92 + Math.floor(Math.random() * 70);

        ctx.fillStyle =
            `rgb(${value}, ${value}, ${value})`;

        ctx.fillRect(
            Math.random() * 512,
            Math.random() * 512,
            1 + Math.random() * 2,
            1 + Math.random() * 2
        );
    }

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.wrapS =
        THREE.RepeatWrapping;

    texture.wrapT =
        THREE.RepeatWrapping;

    texture.repeat.set(80, 80);

    return texture;
}


// ============================================================
// PISO
// ============================================================

const FLOOR_SIZE =
    160;

const FLOOR_RECENTER_STEP =
    20;

const groundTexture =
    createGroundTexture();

const groundBump =
    createGroundBump();

const floor =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            FLOOR_SIZE,
            FLOOR_SIZE
        ),

        new THREE.MeshStandardMaterial({

            map: groundTexture,
            bumpMap: groundBump,
            bumpScale: 0.12,
            roughness: 0.96,
            metalness: 0.02

        })

    );


floor.rotation.x =
    -Math.PI / 2;

floor.receiveShadow =
    true;

scene.add(floor);


// ============================================================
// ILUMINACIÓN
// ============================================================

const hemiLight =
    new THREE.HemisphereLight(
        0xbfd6ff,
        0x080b12,
        1.8
    );

scene.add(hemiLight);


// luz principal tipo luna
const mainLight =
    new THREE.DirectionalLight(
        0xc8dcff,
        2.6
    );

mainLight.position.set(8, 12, 7);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);

scene.add(mainLight);


// luz tenue azul lateral
const blueLight =
    new THREE.PointLight(
        0x507cff,
        0.8,
        40
    );

blueLight.position.set(-8, 5, -8);
scene.add(blueLight);


// ============================================================
// TEXTURA DE HOJA
// ============================================================

function createLeafTexture() {

    const canvas =
        document.createElement('canvas');

    canvas.width = 64;
    canvas.height = 64;

    const ctx =
        canvas.getContext('2d');

    ctx.clearRect(0, 0, 64, 64);

    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate(-0.35);

    const gradient =
        ctx.createLinearGradient(-12, -16, 14, 18);

    gradient.addColorStop(0.00, '#8a9a44');
    gradient.addColorStop(0.50, '#b58f3c');
    gradient.addColorStop(1.00, '#755425');

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, -17);
    ctx.bezierCurveTo(12, -12, 16, -2, 11, 10);
    ctx.bezierCurveTo(8, 16, 3, 19, 0, 21);
    ctx.bezierCurveTo(-4, 18, -10, 12, -12, 4);
    ctx.bezierCurveTo(-14, -5, -10, -13, 0, -17);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(75, 56, 24, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-1, -14);
    ctx.lineTo(1, 16);
    ctx.stroke();

    ctx.restore();

    const texture =
        new THREE.CanvasTexture(canvas);

    texture.colorSpace =
        THREE.SRGBColorSpace;

    return texture;
}


// ============================================================
// HOJAS FLOTANDO
// ============================================================

const LEAF_COUNT =
    260;

const leafPositions =
    new Float32Array(LEAF_COUNT * 3);

const leafSpeeds = [];
const leafDrift = [];

for (let i = 0; i < LEAF_COUNT; i++) {

    const index = i * 3;

    leafPositions[index] =
        (Math.random() - 0.5) * 48;

    leafPositions[index + 1] =
        Math.random() * 12;

    leafPositions[index + 2] =
        (Math.random() - 0.5) * 48;

    leafSpeeds.push(
        0.20 + Math.random() * 0.38
    );

    leafDrift.push(
        0.25 + Math.random() * 0.75
    );
}

const leafGeometry =
    new THREE.BufferGeometry();

leafGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
        leafPositions,
        3
    )
);

const leafMaterial =
    new THREE.PointsMaterial({

        map: createLeafTexture(),
        size: 0.24,
        transparent: true,
        opacity: 0.90,
        depthWrite: false,
        alphaTest: 0.15,
        color: 0xffffff

    });

const leaves =
    new THREE.Points(
        leafGeometry,
        leafMaterial
    );

scene.add(leaves);


// ============================================================
// VARIABLES DE MODELO
// ============================================================

const loader =
    new FBXLoader();

const clock =
    new THREE.Clock();

const actions = {};

let model;
let mixer;
let currentAction = null;
let currentAnimationName = null;


// ============================================================
// MOVIMIENTO
// ============================================================

const MOVE_SPEED =
    2.5;

const TURN_SPEED =
    2.2;

let heading =
    Math.PI;

// Si camina mirando hacia atrás,
// cambia a Math.PI.
const MODEL_FORWARD_OFFSET =
    0;

const forwardDirection =
    new THREE.Vector3();


// ============================================================
// TECLAS DE MOVIMIENTO
// ============================================================

const movementKeys = {

    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false

};


// ============================================================
// ANIMACIONES
// ============================================================

const animationFiles = {

    dagger:
        './assets/models/animations/Double_Dagger.fbx',

    jumping:
        './assets/models/animations/Jumping.fbx',

    punching:
        './assets/models/animations/Punching.fbx',

    stand:
        './assets/models/animations/Stand.fbx',

    uppercut:
        './assets/models/animations/Uppercut.fbx',

    walk:
        './assets/models/animations/Walk.fbx'

};


const animationLabels = {

    dagger:
        'DOUBLE DAGGER',

    jumping:
        'JUMPING',

    punching:
        'PUNCHING',

    stand:
        'STAND',

    uppercut:
        'UPPERCUT',

    walk:
        'WALK'

};


// ============================================================
// CARGAR ANIMACIÓN
// ============================================================

function loadAnimation(name, url) {

    return new Promise((resolve, reject) => {

        loader.load(
            url,
            (fbx) => {

                if (
                    !fbx.animations ||
                    fbx.animations.length === 0
                ) {

                    console.warn(
                        `El archivo ${name} no contiene animaciones.`
                    );

                    resolve();
                    return;
                }

                const clip =
                    fbx.animations[0];

                const action =
                    mixer.clipAction(clip);

                action.setLoop(
                    THREE.LoopRepeat,
                    Infinity
                );

                action.clampWhenFinished =
                    false;

                action.enabled =
                    true;

                actions[name] =
                    action;

                console.log(
                    `Animación cargada: ${name}`
                );

                resolve();

            },
            undefined,
            (error) => {

                console.error(
                    `Error cargando ${name}:`,
                    error
                );

                reject(error);
            }
        );
    });
}


// ============================================================
// REPRODUCIR ANIMACIÓN
// ============================================================

function playAction(name) {

    const nextAction =
        actions[name];

    if (!nextAction) {
        console.warn(`No existe la animación: ${name}`);
        return;
    }

    // no reiniciar si ya está activa
    if (currentAction === nextAction) {
        return;
    }

    // primera animación
    if (!currentAction) {

        nextAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .play();

        currentAction = nextAction;
        currentAnimationName = name;
        updateAnimationName(name);
        return;
    }

    // conservar progreso aproximado
    const currentClip =
        currentAction.getClip();

    let progress = 0;

    if (currentClip.duration > 0) {

        progress =
            (
                currentAction.time %
                currentClip.duration
            )
            / currentClip.duration;
    }

    const nextClip =
        nextAction.getClip();

    nextAction.reset();
    nextAction.enabled = true;
    nextAction.setEffectiveTimeScale(1);
    nextAction.setEffectiveWeight(1);
    nextAction.time = progress * nextClip.duration;
    nextAction.play();

    nextAction.crossFadeFrom(
        currentAction,
        0.30,
        true
    );

    currentAction = nextAction;
    currentAnimationName = name;

    updateAnimationName(name);
}


// ============================================================
// ACTUALIZAR NOMBRE
// ============================================================

function updateAnimationName(name) {

    const element =
        document.getElementById('animation-name');

    if (!element) return;

    element.textContent =
        animationLabels[name] ||
        name.toUpperCase();
}


// ============================================================
// PLANO INFINITO
// ============================================================

function updateInfiniteFloor() {

    if (!model) return;

    floor.position.x =
        Math.floor(model.position.x / FLOOR_RECENTER_STEP)
        * FLOOR_RECENTER_STEP;

    floor.position.z =
        Math.floor(model.position.z / FLOOR_RECENTER_STEP)
        * FLOOR_RECENTER_STEP;
}


// ============================================================
// MOVIMIENTO DEL PERSONAJE
// ============================================================

function updateCharacterMovement(delta) {

    if (!model) return;

    let turnDirection = 0;

    if (movementKeys.ArrowLeft) {
        turnDirection += 1;
    }

    if (movementKeys.ArrowRight) {
        turnDirection -= 1;
    }

    heading +=
        turnDirection *
        TURN_SPEED *
        delta;

    let movementDirection = 0;

    if (movementKeys.ArrowUp) {
        movementDirection = 1;
    }

    if (movementKeys.ArrowDown) {
        movementDirection = -1;
    }

    // izquierda o derecha solas
    if (
        turnDirection !== 0 &&
        movementDirection === 0
    ) {
        movementDirection = 1;
    }

    model.rotation.y =
        heading +
        MODEL_FORWARD_OFFSET;

    if (movementDirection === 0) {
        return;
    }

    forwardDirection.set(
        Math.sin(heading),
        0,
        Math.cos(heading)
    );

    forwardDirection.normalize();

    const distance =
        MOVE_SPEED *
        delta *
        movementDirection;

    const deltaX =
        forwardDirection.x *
        distance;

    const deltaZ =
        forwardDirection.z *
        distance;

    model.position.x += deltaX;
    model.position.z += deltaZ;

    camera.position.x += deltaX;
    camera.position.z += deltaZ;

    controls.target.x += deltaX;
    controls.target.z += deltaZ;
}


// ============================================================
// ACTUALIZAR HOJAS
// ============================================================

function updateLeaves(delta) {

    const positions =
        leafGeometry.attributes.position.array;

    const time =
        performance.now() * 0.001;

    for (let i = 0; i < LEAF_COUNT; i++) {

        const index = i * 3;

        // caída
        positions[index + 1] -=
            leafSpeeds[i] * delta;

        // deriva lateral
        positions[index] +=
            Math.sin(time * leafDrift[i] + i) * 0.010;

        positions[index + 2] +=
            Math.cos(time * 0.7 + i * 0.35) * 0.004;

        // reaparecer arriba
        if (positions[index + 1] < 0) {

            positions[index] =
                (Math.random() - 0.5) * 48;

            positions[index + 1] =
                10 + Math.random() * 4;

            positions[index + 2] =
                (Math.random() - 0.5) * 48;
        }
    }

    leafGeometry.attributes.position.needsUpdate = true;

    // siguen al jugador
    if (model) {
        leaves.position.x = model.position.x;
        leaves.position.z = model.position.z;
    }
}


// ============================================================
// CARGAR PERSONAJE
// ============================================================

loader.load(

    './assets/models/character.fbx',

    async (fbx) => {

        model = fbx;

        model.scale.setScalar(0.01);

        model.position.set(0, 0, 0);

        model.rotation.y =
            heading +
            MODEL_FORWARD_OFFSET;

        model.traverse((child) => {

            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }

        });

        scene.add(model);

        mixer =
            new THREE.AnimationMixer(model);

        try {

            await Promise.all(
                Object
                    .entries(animationFiles)
                    .map(([name, url]) =>
                        loadAnimation(name, url)
                    )
            );

            console.log(
                'Todas las animaciones fueron cargadas.'
            );

            playAction('stand');

        } catch (error) {

            console.error(
                'Error cargando animaciones:',
                error
            );
        }

    },

    undefined,

    (error) => {

        console.error(
            'Error cargando character.fbx:',
            error
        );
    }

);


// ============================================================
// KEYDOWN
// ============================================================

window.addEventListener('keydown', (event) => {

    if (event.code in movementKeys) {

        event.preventDefault();
        movementKeys[event.code] = true;

        playAction('walk');
        return;
    }

    const keyboard = {
        Digit1: 'dagger',
        Digit2: 'jumping',
        Digit3: 'punching',
        Digit4: 'stand',
        Digit5: 'uppercut',
        Digit6: 'walk'
    };

    const animation =
        keyboard[event.code];

    if (animation) {
        playAction(animation);
    }
});


// ============================================================
// KEYUP
// ============================================================

window.addEventListener('keyup', (event) => {

    if (event.code in movementKeys) {
        event.preventDefault();
        movementKeys[event.code] = false;
    }
});


// ============================================================
// BLUR
// ============================================================

window.addEventListener('blur', () => {

    movementKeys.ArrowUp = false;
    movementKeys.ArrowDown = false;
    movementKeys.ArrowLeft = false;
    movementKeys.ArrowRight = false;
});


// ============================================================
// LOOP
// ============================================================

function animate() {

    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );

    if (mixer) {
        mixer.update(delta);
    }

    updateCharacterMovement(delta);
    updateInfiniteFloor();
    updateLeaves(delta);

    // cielo sigue al jugador
    if (model) {
        skyDome.position.x = model.position.x;
        skyDome.position.z = model.position.z;
    }

    controls.update();

    renderer.render(scene, camera);
}


// ============================================================
// INICIAR
// ============================================================

renderer.setAnimationLoop(animate);


// ============================================================
// RESPONSIVE
// ============================================================

window.addEventListener('resize', () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});