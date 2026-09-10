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
    0x16080c;


scene.background =
    new THREE.Color(
        BACKGROUND_COLOR
    );


// ============================================================
// NIEBLA
// ============================================================

scene.fog =
    new THREE.FogExp2(
        0x2b1115,
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

        antialias:
            true

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
    1.15;


document
    .getElementById(
        'scene-container'
    )
    .appendChild(
        renderer.domElement
    );


// ============================================================
// CÁMARA - ORBIT CONTROLS
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
// CREAR CIELO SAMURAI PROCEDURAL
// ============================================================

function createSamuraiSky() {

    const canvas =
        document.createElement(
            'canvas'
        );


    canvas.width =
        2048;


    canvas.height =
        1024;


    const ctx =
        canvas.getContext(
            '2d'
        );


    // ========================================================
    // CIELO
    // ========================================================

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );


    gradient.addColorStop(
        0,
        '#080710'
    );


    gradient.addColorStop(
        0.24,
        '#17101e'
    );


    gradient.addColorStop(
        0.48,
        '#441522'
    );


    gradient.addColorStop(
        0.68,
        '#852521'
    );


    gradient.addColorStop(
        0.82,
        '#c25930'
    );


    gradient.addColorStop(
        1,
        '#291116'
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(

        0,
        0,

        canvas.width,

        canvas.height

    );


    // ========================================================
    // RESPLANDOR
    // ========================================================

    const sunX =
        canvas.width *
        0.5;


    const sunY =
        canvas.height *
        0.57;


    const glow =
        ctx.createRadialGradient(

            sunX,
            sunY,
            20,

            sunX,
            sunY,
            330

        );


    glow.addColorStop(
        0,
        'rgba(255,210,135,0.75)'
    );


    glow.addColorStop(
        0.35,
        'rgba(255,110,70,0.30)'
    );


    glow.addColorStop(
        1,
        'rgba(255,70,40,0)'
    );


    ctx.fillStyle =
        glow;


    ctx.fillRect(

        sunX - 350,

        sunY - 350,

        700,

        700

    );


    // ========================================================
    // SOL JAPONÉS
    // ========================================================

    ctx.beginPath();


    ctx.arc(

        sunX,

        sunY,

        115,

        0,

        Math.PI * 2

    );


    ctx.fillStyle =
        '#ffb067';


    ctx.fill();


    // ========================================================
    // NUBES
    // ========================================================

    for (
        let i = 0;
        i < 22;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;


        const y =
            canvas.height *
            (
                0.47 +
                Math.random() *
                0.25
            );


        const width =
            120 +
            Math.random() *
            280;


        const height =
            10 +
            Math.random() *
            35;


        ctx.fillStyle =

            `rgba(
                255,
                190,
                150,
                ${0.025 +
            Math.random() *
            0.04
            }
            )`;


        ctx.beginPath();


        ctx.ellipse(

            x,
            y,

            width,
            height,

            0,

            0,

            Math.PI * 2

        );


        ctx.fill();

    }


    // ========================================================
    // MONTAÑAS LEJANAS
    // ========================================================

    ctx.fillStyle =
        '#241016';


    ctx.beginPath();


    ctx.moveTo(
        0,
        canvas.height *
        0.76
    );


    for (
        let x = 0;
        x <= canvas.width;
        x += 120
    ) {

        const peak =

            canvas.height *

            (
                0.58 +
                Math.random() *
                0.12
            );


        ctx.lineTo(

            x + 60,

            peak

        );


        ctx.lineTo(

            x + 120,

            canvas.height *
            0.76

        );

    }


    ctx.lineTo(

        canvas.width,

        canvas.height

    );


    ctx.lineTo(

        0,

        canvas.height

    );


    ctx.closePath();


    ctx.fill();


    // ========================================================
    // MONTAÑAS CERCANAS
    // ========================================================

    ctx.fillStyle =
        '#10090c';


    ctx.beginPath();


    ctx.moveTo(
        0,
        canvas.height *
        0.82
    );


    for (
        let x = 0;
        x <= canvas.width;
        x += 95
    ) {

        const peak =

            canvas.height *

            (
                0.69 +
                Math.random() *
                0.08
            );


        ctx.lineTo(

            x + 48,

            peak

        );


        ctx.lineTo(

            x + 95,

            canvas.height *
            0.82

        );

    }


    ctx.lineTo(

        canvas.width,

        canvas.height

    );


    ctx.lineTo(

        0,

        canvas.height

    );


    ctx.closePath();


    ctx.fill();


    // ========================================================
    // TORII EN SILUETA
    // ========================================================

    const toriiX =
        canvas.width *
        0.68;


    const toriiY =
        canvas.height *
        0.76;


    ctx.fillStyle =
        '#080507';


    // columnas
    ctx.fillRect(
        toriiX - 60,
        toriiY - 120,
        14,
        125
    );


    ctx.fillRect(
        toriiX + 46,
        toriiY - 120,
        14,
        125
    );


    // travesaño
    ctx.fillRect(
        toriiX - 90,
        toriiY - 125,
        180,
        13
    );


    // techo
    ctx.fillRect(
        toriiX - 110,
        toriiY - 145,
        220,
        12
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

}


// ============================================================
// DOMO DEL CIELO
// ============================================================

const samuraiSky =
    createSamuraiSky();


const skyDome =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            400,
            48,
            32
        ),

        new THREE.MeshBasicMaterial({

            map:
                samuraiSky,

            side:
                THREE.BackSide,

            fog:
                false

        })

    );


scene.add(
    skyDome
);


// ============================================================
// TEXTURA PROCEDURAL DEL PISO
// ============================================================

function createGroundTexture() {

    const canvas =
        document.createElement(
            'canvas'
        );


    canvas.width =
        1024;


    canvas.height =
        1024;


    const ctx =
        canvas.getContext(
            '2d'
        );


    // ========================================================
    // BASE
    // ========================================================

    ctx.fillStyle =
        '#35231a';


    ctx.fillRect(

        0,
        0,

        canvas.width,
        canvas.height

    );


    // ========================================================
    // VARIACIÓN DE TIERRA
    // ========================================================

    for (
        let i = 0;
        i < 9000;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;


        const y =
            Math.random() *
            canvas.height;


        const size =
            1 +
            Math.random() *
            4;


        const brightness =
            30 +
            Math.floor(
                Math.random() *
                35
            );


        ctx.fillStyle =

            `rgba(
                ${brightness + 25
            },
                ${brightness + 10
            },
                ${brightness},
                ${0.04 +
            Math.random() *
            0.10
            }
            )`;


        ctx.fillRect(

            x,
            y,

            size,
            size

        );

    }


    // ========================================================
    // PIEDRAS
    // ========================================================

    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;


        const y =
            Math.random() *
            canvas.height;


        const rx =
            4 +
            Math.random() *
            10;


        const ry =
            2 +
            Math.random() *
            6;


        ctx.fillStyle =

            `rgba(
                70,
                62,
                54,
                ${0.2 +
            Math.random() *
            0.25
            }
            )`;


        ctx.beginPath();


        ctx.ellipse(

            x,
            y,

            rx,
            ry,

            Math.random() *
            Math.PI,

            0,

            Math.PI * 2

        );


        ctx.fill();

    }


    // ========================================================
    // LÍNEAS DE ARENA
    // ========================================================

    ctx.lineWidth =
        1.2;


    for (
        let y = 0;
        y < canvas.height;
        y += 24
    ) {

        ctx.strokeStyle =
            'rgba(210,170,110,0.055)';


        ctx.beginPath();


        for (
            let x = 0;
            x <= canvas.width;
            x += 12
        ) {

            const wave =

                Math.sin(

                    x *
                    0.018

                    +

                    y *
                    0.025

                )

                *

                2.5;


            if (
                x === 0
            ) {

                ctx.moveTo(

                    x,

                    y + wave

                );

            }

            else {

                ctx.lineTo(

                    x,

                    y + wave

                );

            }

        }


        ctx.stroke();

    }


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.wrapS =
        THREE.RepeatWrapping;


    texture.wrapT =
        THREE.RepeatWrapping;


    texture.repeat.set(
        40,
        40
    );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    texture.anisotropy =

        renderer
            .capabilities
            .getMaxAnisotropy();


    return texture;

}


// ============================================================
// BUMP DEL PISO
// ============================================================

function createGroundBump() {

    const canvas =
        document.createElement(
            'canvas'
        );


    canvas.width =
        512;


    canvas.height =
        512;


    const ctx =
        canvas.getContext(
            '2d'
        );


    ctx.fillStyle =
        '#777777';


    ctx.fillRect(
        0,
        0,
        512,
        512
    );


    for (
        let i = 0;
        i < 12000;
        i++
    ) {

        const value =
            90 +
            Math.floor(
                Math.random() *
                85
            );


        ctx.fillStyle =
            `rgb(
                ${value},
                ${value},
                ${value}
            )`;


        ctx.fillRect(

            Math.random() *
            512,

            Math.random() *
            512,

            1 +
            Math.random() *
            2,

            1 +
            Math.random() *
            2

        );

    }


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.wrapS =
        THREE.RepeatWrapping;


    texture.wrapT =
        THREE.RepeatWrapping;


    texture.repeat.set(
        80,
        80
    );


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

            map:
                groundTexture,

            bumpMap:
                groundBump,

            bumpScale:
                0.12,

            roughness:
                0.95,

            metalness:
                0.02

        })

    );


floor.rotation.x =
    -Math.PI / 2;


floor.receiveShadow =
    true;


scene.add(
    floor
);


// ============================================================
// ILUMINACIÓN
// ============================================================

const hemiLight =
    new THREE.HemisphereLight(

        0xffcfaa,

        0x1b0a0d,

        2.2

    );


scene.add(
    hemiLight
);


const mainLight =
    new THREE.DirectionalLight(

        0xffc187,

        3.2

    );


mainLight.position.set(
    8,
    12,
    7
);


mainLight.castShadow =
    true;


mainLight.shadow.mapSize.set(
    2048,
    2048
);


scene.add(
    mainLight
);


// Luz rojiza lateral

const redLight =
    new THREE.PointLight(

        0xc33131,

        1.5,

        35

    );


redLight.position.set(
    -7,
    4,
    -6
);


scene.add(
    redLight
);


// ============================================================
// PÉTALOS DE SAKURA
// ============================================================

const PETAL_COUNT =
    350;


const petalPositions =
    new Float32Array(
        PETAL_COUNT *
        3
    );


const petalSpeeds =
    [];


for (
    let i = 0;
    i < PETAL_COUNT;
    i++
) {

    const index =
        i * 3;


    petalPositions[index] =
        (
            Math.random() -
            0.5
        ) * 45;


    petalPositions[
        index + 1
    ] =
        Math.random() *
        12;


    petalPositions[
        index + 2
    ] =
        (
            Math.random() -
            0.5
        ) * 45;


    petalSpeeds.push(

        0.25 +
        Math.random() *
        0.45

    );

}


const petalGeometry =
    new THREE.BufferGeometry();


petalGeometry.setAttribute(

    'position',

    new THREE.BufferAttribute(

        petalPositions,

        3

    )

);


const petalMaterial =
    new THREE.PointsMaterial({

        color:
            0xffa7b8,

        size:
            0.055,

        transparent:
            true,

        opacity:
            0.8,

        depthWrite:
            false

    });


const petals =
    new THREE.Points(

        petalGeometry,

        petalMaterial

    );


scene.add(
    petals
);


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


let currentAction =
    null;


let currentAnimationName =
    null;


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

    ArrowUp:
        false,

    ArrowDown:
        false,

    ArrowLeft:
        false,

    ArrowRight:
        false

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

function loadAnimation(
    name,
    url
) {

    return new Promise(

        (
            resolve,
            reject
        ) => {

            loader.load(

                url,

                (fbx) => {

                    if (

                        !fbx.animations

                        ||

                        fbx.animations.length ===
                        0

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
                        mixer.clipAction(
                            clip
                        );


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


                    reject(
                        error
                    );

                }

            );

        }

    );

}


// ============================================================
// REPRODUCIR ANIMACIÓN
// ============================================================

function playAction(
    name
) {

    const nextAction =
        actions[name];


    if (
        !nextAction
    ) {

        console.warn(

            `No existe la animación: ${name}`

        );


        return;

    }


    // No reiniciar si ya está activa.
    if (
        currentAction ===
        nextAction
    ) {

        return;

    }


    // ========================================================
    // PRIMERA ANIMACIÓN
    // ========================================================

    if (
        !currentAction
    ) {

        nextAction
            .reset()
            .setEffectiveTimeScale(
                1
            )
            .setEffectiveWeight(
                1
            )
            .play();


        currentAction =
            nextAction;


        currentAnimationName =
            name;


        updateAnimationName(
            name
        );


        return;

    }


    // ========================================================
    // PROGRESO ACTUAL
    // ========================================================

    const currentClip =
        currentAction.getClip();


    let progress =
        0;


    if (
        currentClip.duration >
        0
    ) {

        progress =

            (
                currentAction.time
                %
                currentClip.duration
            )

            /

            currentClip.duration;

    }


    // ========================================================
    // NUEVA ANIMACIÓN
    // ========================================================

    const nextClip =
        nextAction.getClip();


    nextAction.reset();


    nextAction.enabled =
        true;


    nextAction.setEffectiveTimeScale(
        1
    );


    nextAction.setEffectiveWeight(
        1
    );


    nextAction.time =

        progress *

        nextClip.duration;


    nextAction.play();


    nextAction.crossFadeFrom(

        currentAction,

        0.30,

        true

    );


    currentAction =
        nextAction;


    currentAnimationName =
        name;


    updateAnimationName(
        name
    );

}


// ============================================================
// ACTUALIZAR NOMBRE
// ============================================================

function updateAnimationName(
    name
) {

    const element =
        document.getElementById(
            'animation-name'
        );


    if (
        !element
    ) {

        return;

    }


    element.textContent =

        animationLabels[name]

        ||

        name.toUpperCase();

}


// ============================================================
// PLANO INFINITO
// ============================================================

function updateInfiniteFloor() {

    if (
        !model
    ) {

        return;

    }


    // El piso se recoloca en bloques.
    // No sigue exactamente al personaje,
    // porque eso haría que pareciera una
    // caminadora.

    floor.position.x =

        Math.floor(

            model.position.x /

            FLOOR_RECENTER_STEP

        )

        *

        FLOOR_RECENTER_STEP;


    floor.position.z =

        Math.floor(

            model.position.z /

            FLOOR_RECENTER_STEP

        )

        *

        FLOOR_RECENTER_STEP;

}


// ============================================================
// MOVIMIENTO DEL PERSONAJE
// ============================================================

function updateCharacterMovement(
    delta
) {

    if (
        !model
    ) {

        return;

    }


    let turnDirection =
        0;


    // izquierda
    if (
        movementKeys.ArrowLeft
    ) {

        turnDirection +=
            1;

    }


    // derecha
    if (
        movementKeys.ArrowRight
    ) {

        turnDirection -=
            1;

    }


    // ========================================================
    // GIRO PROGRESIVO
    // ========================================================

    heading +=

        turnDirection

        *

        TURN_SPEED

        *

        delta;


    let movementDirection =
        0;


    // adelante
    if (
        movementKeys.ArrowUp
    ) {

        movementDirection =
            1;

    }


    // atrás
    if (
        movementKeys.ArrowDown
    ) {

        movementDirection =
            -1;

    }


    // Flecha izquierda/derecha sola:
    // sigue caminando mientras gira.

    if (

        turnDirection !== 0

        &&

        movementDirection === 0

    ) {

        movementDirection =
            1;

    }


    model.rotation.y =

        heading

        +

        MODEL_FORWARD_OFFSET;


    if (
        movementDirection === 0
    ) {

        return;

    }


    // ========================================================
    // DIRECCIÓN
    // ========================================================

    forwardDirection.set(

        Math.sin(
            heading
        ),

        0,

        Math.cos(
            heading
        )

    );


    forwardDirection.normalize();


    const distance =

        MOVE_SPEED

        *

        delta

        *

        movementDirection;


    const deltaX =

        forwardDirection.x

        *

        distance;


    const deltaZ =

        forwardDirection.z

        *

        distance;


    // ========================================================
    // PERSONAJE
    // ========================================================

    model.position.x +=
        deltaX;


    model.position.z +=
        deltaZ;


    // ========================================================
    // CÁMARA SIGUE AL PERSONAJE
    // ========================================================

    camera.position.x +=
        deltaX;


    camera.position.z +=
        deltaZ;


    controls.target.x +=
        deltaX;


    controls.target.z +=
        deltaZ;

}


// ============================================================
// ACTUALIZAR PÉTALOS
// ============================================================

function updatePetals(
    delta
) {

    const positions =

        petalGeometry
            .attributes
            .position
            .array;


    for (
        let i = 0;
        i < PETAL_COUNT;
        i++
    ) {

        const index =
            i * 3;


        positions[
            index + 1
        ] -=

            petalSpeeds[i]

            *

            delta;


        positions[index] +=

            Math.sin(

                performance.now()
                *
                0.001

                +

                i

            )

            *

            0.003;


        if (
            positions[
            index + 1
            ] < 0
        ) {

            positions[
                index + 1
            ] =
                10 +
                Math.random() *
                4;

        }

    }


    petalGeometry
        .attributes
        .position
        .needsUpdate =
        true;


    // Los pétalos siguen aproximadamente
    // la zona donde está el jugador.

    if (
        model
    ) {

        petals.position.x =
            model.position.x;


        petals.position.z =
            model.position.z;

    }

}


// ============================================================
// CARGAR PERSONAJE
// ============================================================

loader.load(

    './assets/models/character.fbx',

    async (
        fbx
    ) => {

        model =
            fbx;


        model.scale.setScalar(
            0.01
        );


        model.position.set(
            0,
            0,
            0
        );


        model.rotation.y =

            heading

            +

            MODEL_FORWARD_OFFSET;


        model.traverse(

            (
                child
            ) => {

                if (
                    child.isMesh
                ) {

                    child.castShadow =
                        true;


                    child.receiveShadow =
                        true;

                }

            }

        );


        scene.add(
            model
        );


        mixer =
            new THREE.AnimationMixer(
                model
            );


        try {

            await Promise.all(

                Object
                    .entries(
                        animationFiles
                    )
                    .map(

                        (
                            [
                                name,
                                url
                            ]
                        ) =>

                            loadAnimation(
                                name,
                                url
                            )

                    )

            );


            console.log(

                'Todas las animaciones fueron cargadas.'

            );


            playAction(
                'stand'
            );

        }

        catch (
        error
        ) {

            console.error(

                'Error cargando animaciones:',

                error

            );

        }

    },

    undefined,

    (
        error
    ) => {

        console.error(

            'Error cargando character.fbx:',

            error

        );

    }

);


// ============================================================
// KEYDOWN
// ============================================================

window.addEventListener(

    'keydown',

    (
        event
    ) => {

        // ====================================================
        // FLECHAS
        // ====================================================

        if (
            event.code
            in
            movementKeys
        ) {

            event.preventDefault();


            movementKeys[
                event.code
            ] =
                true;


            // Walk no se reinicia
            // si ya está activo.

            playAction(
                'walk'
            );


            return;

        }


        // ====================================================
        // ANIMACIONES
        // ====================================================

        const keyboard = {

            Digit1:
                'dagger',

            Digit2:
                'jumping',

            Digit3:
                'punching',

            Digit4:
                'stand',

            Digit5:
                'uppercut',

            Digit6:
                'walk'

        };


        const animation =
            keyboard[
            event.code
            ];


        if (
            animation
        ) {

            playAction(
                animation
            );

        }

    }

);


// ============================================================
// KEYUP
// ============================================================

window.addEventListener(

    'keyup',

    (
        event
    ) => {

        if (
            event.code
            in
            movementKeys
        ) {

            event.preventDefault();


            movementKeys[
                event.code
            ] =
                false;


            // NO cambiar a Stand.
            // La animación Walk puede continuar.

        }

    }

);


// ============================================================
// VENTANA PIERDE FOCO
// ============================================================

window.addEventListener(

    'blur',

    () => {

        movementKeys.ArrowUp =
            false;


        movementKeys.ArrowDown =
            false;


        movementKeys.ArrowLeft =
            false;


        movementKeys.ArrowRight =
            false;

    }

);


// ============================================================
// LOOP
// ============================================================

function animate() {

    const delta =

        Math.min(

            clock.getDelta(),

            0.05

        );


    // ========================================================
    // ANIMACIONES
    // ========================================================

    if (
        mixer
    ) {

        mixer.update(
            delta
        );

    }


    // ========================================================
    // PERSONAJE
    // ========================================================

    updateCharacterMovement(
        delta
    );


    // ========================================================
    // PISO
    // ========================================================

    updateInfiniteFloor();


    // ========================================================
    // PÉTALOS
    // ========================================================

    updatePetals(
        delta
    );


    // ========================================================
    // EL CIELO SIGUE AL JUGADOR
    // ========================================================

    if (
        model
    ) {

        skyDome.position.x =
            model.position.x;


        skyDome.position.z =
            model.position.z;

    }


    // ========================================================
    // CONTROLES
    // ========================================================

    controls.update();


    // ========================================================
    // RENDER
    // ========================================================

    renderer.render(

        scene,

        camera

    );

}


// ============================================================
// INICIAR
// ============================================================

renderer.setAnimationLoop(
    animate
);


// ============================================================
// RESPONSIVE
// ============================================================

window.addEventListener(

    'resize',

    () => {

        camera.aspect =

            window.innerWidth

            /

            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }

);