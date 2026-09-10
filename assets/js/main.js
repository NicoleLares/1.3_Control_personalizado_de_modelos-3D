import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


// ============================================================
// INTERFAZ
// ============================================================

const animationNameElement =
    document.getElementById('animation-name');


function setStatus(text) {

    if (animationNameElement) {

        animationNameElement.textContent =
            text;

    }

}


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

        antialias: true,

        powerPreference:
            'high-performance'

    });


renderer.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        1.75
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


// 1024 en vez de 2048
// para cargar/renderizar más rápido.

mainLight.shadow.mapSize.set(
    1024,
    1024
);


scene.add(
    mainLight
);


// Luz rojiza ambiental

const redLight =
    new THREE.PointLight(

        0xc33131,

        1.3,

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
// PISO BASE
// ============================================================
//
// Primero mostramos un piso sencillo.
//
// Después agregaremos la textura procedural.
//
// Esto evita retrasar la carga del personaje.
// ============================================================

const FLOOR_SIZE =
    160;


const FLOOR_RECENTER_STEP =
    20;


const floorMaterial =
    new THREE.MeshStandardMaterial({

        color:
            0x35231a,

        roughness:
            0.95,

        metalness:
            0.02

    });


const floor =
    new THREE.Mesh(

        new THREE.PlaneGeometry(

            FLOOR_SIZE,

            FLOOR_SIZE

        ),

        floorMaterial

    );


floor.rotation.x =
    -Math.PI / 2;


floor.receiveShadow =
    true;


scene.add(
    floor
);


// ============================================================
// MODELO Y ANIMACIONES
// ============================================================

const characterLoader =
    new FBXLoader();


const animationLoader =
    new FBXLoader();


const clock =
    new THREE.Clock();


const actions =
    {};


const animationPromises =
    {};


let model =
    null;


let mixer =
    null;


let currentAction =
    null;


let currentAnimationName =
    null;


// Guarda la última animación
// seleccionada por el usuario.

let pendingAnimationName =
    null;


// ============================================================
// ARCHIVOS DE ANIMACIÓN
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


// ============================================================
// NOMBRES DE ANIMACIONES
// ============================================================

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
// MOVIMIENTO
// ============================================================

const MOVE_SPEED =
    2.5;


const TURN_SPEED =
    2.2;


let heading =
    Math.PI;


// Si el personaje camina
// mirando hacia atrás:
//
// cambia 0 por Math.PI.

const MODEL_FORWARD_OFFSET =
    0;


const forwardDirection =
    new THREE.Vector3();


// ============================================================
// FLECHAS
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
// CARGAR ANIMACIÓN BAJO DEMANDA
// ============================================================
//
// Esta función evita cargar dos veces
// el mismo archivo.
//
// Si ya está cargado lo reutiliza.
// ============================================================

function ensureAnimationLoaded(
    name
) {

    // Ya cargada
    if (
        actions[name]
    ) {

        return Promise.resolve(
            actions[name]
        );

    }


    // Ya se está descargando
    if (
        animationPromises[name]
    ) {

        return animationPromises[
            name
        ];

    }


    // Modelo todavía no disponible
    if (
        !mixer
    ) {

        return Promise.reject(

            new Error(
                'El modelo todavía no está listo.'
            )

        );

    }


    const url =
        animationFiles[name];


    // ========================================================
    // CREAR PROMESA DE CARGA
    // ========================================================

    animationPromises[name] =
        new Promise(

            (
                resolve,
                reject
            ) => {

                animationLoader.load(

                    url,

                    // =================================================
                    // CARGADA
                    // =================================================

                    (
                        fbx
                    ) => {

                        if (

                            !fbx.animations

                            ||

                            fbx.animations.length ===
                            0

                        ) {

                            reject(

                                new Error(

                                    `${name} no contiene animaciones.`

                                )

                            );


                            return;

                        }


                        const clip =
                            fbx.animations[0];


                        const action =
                            mixer.clipAction(
                                clip
                            );


                        // =================================================
                        // REPETICIÓN INFINITA
                        // =================================================

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

                            `✅ Animación cargada: ${name}`

                        );


                        resolve(
                            action
                        );

                    },


                    // =================================================
                    // PROGRESO
                    // =================================================

                    undefined,


                    // =================================================
                    // ERROR
                    // =================================================

                    (
                        error
                    ) => {

                        console.error(

                            `❌ Error cargando ${name}:`,

                            error

                        );


                        reject(
                            error
                        );

                    }

                );

            }

        )
        .catch(

            (
                error
            ) => {

                // Si falla permitimos
                // volver a intentarlo.

                delete animationPromises[
                    name
                ];


                throw error;

            }

        );


    return animationPromises[
        name
    ];

}


// ============================================================
// REPRODUCIR ANIMACIÓN
// ============================================================

async function playAction(
    name
) {

    // Guardamos la animación
    // más reciente elegida.

    pendingAnimationName =
        name;


    // ========================================================
    // MODELO TODAVÍA CARGANDO
    // ========================================================

    if (
        !mixer
    ) {

        setStatus(
            'CARGANDO MODELO'
        );


        return;

    }


    // ========================================================
    // SI LA ANIMACIÓN NO ESTÁ CARGADA
    // ========================================================

    if (
        !actions[name]
    ) {

        setStatus(

            `CARGANDO ${
                animationLabels[name]

                ||

                name.toUpperCase()
            }`

        );


        try {

            await ensureAnimationLoaded(
                name
            );

        }

        catch (
            error
        ) {

            console.error(

                `No se pudo reproducir ${name}:`,

                error

            );


            setStatus(
                'ERROR ANIMACIÓN'
            );


            return;

        }

    }


    // ========================================================
    // SI EL USUARIO CAMBIÓ DE ANIMACIÓN
    // MIENTRAS ESTABA CARGANDO
    // ========================================================

    if (
        pendingAnimationName !==
        name
    ) {

        return;

    }


    const nextAction =
        actions[name];


    if (
        !nextAction
    ) {

        return;

    }


    // ========================================================
    // NO REINICIAR SI YA ESTÁ ACTIVA
    // ========================================================
    //
    // Fundamental para WALK.
    // ========================================================

    if (
        currentAction ===
        nextAction
    ) {

        currentAnimationName =
            name;


        setStatus(
            animationLabels[name]
        );


        return;

    }


    // ========================================================
    // CONFIGURAR NUEVA ANIMACIÓN
    // ========================================================

    nextAction.enabled =
        true;


    nextAction.setEffectiveTimeScale(
        1
    );


    nextAction.setEffectiveWeight(
        1
    );


    // ========================================================
    // PRIMERA ANIMACIÓN
    // ========================================================

    if (
        !currentAction
    ) {

        nextAction
            .reset()
            .play();

    }


    // ========================================================
    // TRANSICIÓN ENTRE ANIMACIONES
    // ========================================================

    else {

        nextAction
            .reset()
            .play();


        nextAction.crossFadeFrom(

            currentAction,

            0.25,

            true

        );

    }


    currentAction =
        nextAction;


    currentAnimationName =
        name;


    setStatus(
        animationLabels[name]
    );

}


// ============================================================
// PRIORIDAD DE ANIMACIONES
// ============================================================
//
// Primero:
//
// 1. STAND
// 2. WALK
//
// Después:
//
// 3. Dagger
// 4. Jumping
// 5. Punching
// 6. Uppercut
//
// ============================================================

async function preloadAnimationsInPriorityOrder() {

    const requested =
        pendingAnimationName;


    // ========================================================
    // PRIMERA ANIMACIÓN
    // ========================================================

    try {

        // Si el usuario presionó una tecla
        // mientras el modelo cargaba,
        // le damos prioridad.

        if (
            requested
        ) {

            await ensureAnimationLoaded(
                requested
            );


            await playAction(
                requested
            );

        }


        // Si no seleccionó ninguna,
        // cargamos Stand primero.

        else {

            await ensureAnimationLoaded(
                'stand'
            );


            await playAction(
                'stand'
            );

        }

    }

    catch (
        error
    ) {

        console.error(

            'Error cargando animación inicial:',

            error

        );


        setStatus(
            'MODELO LISTO'
        );

    }


    // ========================================================
    // PRECARGAR STAND Y WALK
    // ========================================================

    for (
        const name
        of
        [
            'stand',
            'walk'
        ]
    ) {

        if (
            !actions[name]
        ) {

            try {

                await ensureAnimationLoaded(
                    name
                );

            }

            catch (
                error
            ) {

                console.error(

                    `No se pudo precargar ${name}:`,

                    error

                );

            }

        }

    }


    // ========================================================
    // RESTO EN SEGUNDO PLANO
    // ========================================================

    Promise
        .allSettled(

            [
                'dagger',
                'jumping',
                'punching',
                'uppercut'
            ]
            .map(

                (
                    name
                ) =>

                    ensureAnimationLoaded(
                        name
                    )

            )

        )
        .then(

            () => {

                console.log(

                    '✅ Las animaciones secundarias terminaron de cargar.'

                );

            }

        );

}


// ============================================================
// COLOCAR PERSONAJE SOBRE EL PISO
// ============================================================

function placeModelOnGround() {

    if (
        !model
    ) {

        return;

    }


    model.updateMatrixWorld(
        true
    );


    const box =
        new THREE.Box3()
            .setFromObject(
                model
            );


    if (
        Number.isFinite(
            box.min.y
        )
    ) {

        model.position.y -=
            box.min.y;


        model.updateMatrixWorld(
            true
        );

    }

}


// ============================================================
// CARGAR PERSONAJE PRIMERO
// ============================================================
//
// ESTA ES LA OPTIMIZACIÓN MÁS IMPORTANTE.
//
// character.fbx se descarga ANTES
// de las animaciones.
// ============================================================

function loadCharacterFirst() {

    setStatus(
        'CARGANDO MODELO'
    );


    characterLoader.load(

        './assets/models/character.fbx',


        // ====================================================
        // MODELO CARGADO
        // ====================================================

        (
            fbx
        ) => {

            model =
                fbx;


            // =================================================
            // ESCALA
            // =================================================

            model.scale.setScalar(
                0.01
            );


            // =================================================
            // POSICIÓN
            // =================================================

            model.position.set(
                0,
                0,
                0
            );


            // =================================================
            // ROTACIÓN
            // =================================================

            model.rotation.y =

                heading

                +

                MODEL_FORWARD_OFFSET;


            // =================================================
            // SOMBRAS
            // =================================================

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


            // =================================================
            // MOSTRAR PERSONAJE INMEDIATAMENTE
            // =================================================
            //
            // No esperamos ninguna animación.
            // =================================================

            scene.add(
                model
            );


            placeModelOnGround();


            // =================================================
            // MIXER
            // =================================================

            mixer =
                new THREE.AnimationMixer(
                    model
                );


            // =================================================
            // CÁMARA APUNTA AL PERSONAJE
            // =================================================

            controls.target.set(

                model.position.x,

                model.position.y + 1,

                model.position.z

            );


            controls.update();


            // =================================================
            // PERSONAJE YA VISIBLE
            // =================================================

            setStatus(
                'MODELO LISTO'
            );


            console.log(

                '✅ character.fbx ya está visible.'

            );


            // =================================================
            // DESPUÉS CARGAMOS ANIMACIONES
            // =================================================
            //
            // requestAnimationFrame permite
            // que primero se dibuje el personaje.
            // =================================================

            requestAnimationFrame(

                () => {

                    preloadAnimationsInPriorityOrder();

                }

            );

        },


        // ====================================================
        // PROGRESO DE DESCARGA
        // ====================================================

        (
            xhr
        ) => {

            if (
                xhr.total >
                0
            ) {

                const percent =

                    Math.round(

                        (
                            xhr.loaded

                            /

                            xhr.total
                        )

                        *

                        100

                    );


                setStatus(

                    `MODELO ${percent}%`

                );

            }


            // Si GitHub Pages no envía
            // Content-Length mostramos MB.

            else {

                const mb =

                    (
                        xhr.loaded

                        /

                        1024

                        /

                        1024
                    )
                    .toFixed(
                        1
                    );


                setStatus(

                    `MODELO ${mb} MB`

                );

            }

        },


        // ====================================================
        // ERROR
        // ====================================================

        (
            error
        ) => {

            console.error(

                '❌ Error cargando character.fbx:',

                error

            );


            setStatus(
                'ERROR MODELO'
            );

        }

    );

}


// ============================================================
// VARIABLES DEL ENTORNO SAMURÁI
// ============================================================

let skyDome =
    null;


let petals =
    null;


let petalGeometry =
    null;


let petalSpeeds =
    null;


let environmentReady =
    false;


// Menos partículas para mejorar rendimiento.

const PETAL_COUNT =
    180;


// ============================================================
// CIELO SAMURÁI PROCEDURAL
// ============================================================

function createSamuraiSky() {

    const canvas =
        document.createElement(
            'canvas'
        );


    // Antes era más grande.
    // 1024 × 512 es suficiente.

    canvas.width =
        1024;


    canvas.height =
        512;


    const ctx =
        canvas.getContext(
            '2d'
        );


    // ========================================================
    // GRADIENTE DEL CIELO
    // ========================================================

    const gradient =
        ctx.createLinearGradient(

            0,
            0,

            0,
            canvas.height

        );


    gradient.addColorStop(
        0.00,
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
        1.00,
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
    // SOL JAPONÉS
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
            10,

            sunX,
            sunY,
            165

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

        sunX - 180,

        sunY - 180,

        360,

        360

    );


    ctx.beginPath();


    ctx.arc(

        sunX,

        sunY,

        58,

        0,

        Math.PI *
        2

    );


    ctx.fillStyle =
        '#ffb067';


    ctx.fill();


    // ========================================================
    // NUBES
    // ========================================================

    for (
        let i = 0;
        i < 14;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;


        const y =

            canvas.height

            *

            (
                0.47

                +

                Math.random() *
                0.25
            );


        const width =

            60

            +

            Math.random() *
            140;


        const height =

            5

            +

            Math.random() *
            18;


        ctx.fillStyle =

            `rgba(
                255,
                190,
                150,
                ${
                    0.025

                    +

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

            Math.PI *
            2

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

        x <=
        canvas.width;

        x += 60

    ) {

        const peak =

            canvas.height

            *

            (
                0.58

                +

                Math.random() *
                0.12
            );


        ctx.lineTo(

            x + 30,

            peak

        );


        ctx.lineTo(

            x + 60,

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

        x <=
        canvas.width;

        x += 48

    ) {

        const peak =

            canvas.height

            *

            (
                0.69

                +

                Math.random() *
                0.08
            );


        ctx.lineTo(

            x + 24,

            peak

        );


        ctx.lineTo(

            x + 48,

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

        toriiX - 30,

        toriiY - 60,

        7,

        63

    );


    ctx.fillRect(

        toriiX + 23,

        toriiY - 60,

        7,

        63

    );


    // travesaño

    ctx.fillRect(

        toriiX - 45,

        toriiY - 63,

        90,

        7

    );


    // techo

    ctx.fillRect(

        toriiX - 55,

        toriiY - 73,

        110,

        7

    );


    // ========================================================
    // TEXTURA
    // ========================================================

    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

}


// ============================================================
// TEXTURA PROCEDURAL DEL PISO
// ============================================================

function createGroundTexture() {

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
    // TIERRA / GRANULADO
    // ========================================================

    for (
        let i = 0;
        i < 3000;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;


        const y =
            Math.random() *
            canvas.height;


        const size =
            1

            +

            Math.random() *
            3;


        const brightness =

            30

            +

            Math.floor(

                Math.random() *
                35

            );


        ctx.fillStyle =

            `rgba(
                ${
                    brightness +
                    25
                },
                ${
                    brightness +
                    10
                },
                ${brightness},
                ${
                    0.04

                    +

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
        i < 60;
        i++
    ) {

        const x =
            Math.random() *
            canvas.width;


        const y =
            Math.random() *
            canvas.height;


        const rx =

            2

            +

            Math.random() *
            6;


        const ry =

            1

            +

            Math.random() *
            4;


        ctx.fillStyle =

            `rgba(
                70,
                62,
                54,
                ${
                    0.2

                    +

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

            Math.PI *
            2

        );


        ctx.fill();

    }


    // ========================================================
    // LÍNEAS TIPO JARDÍN JAPONÉS
    // ========================================================

    ctx.lineWidth =
        1;


    for (

        let y = 0;

        y <
        canvas.height;

        y += 18

    ) {

        ctx.strokeStyle =
            'rgba(210,170,110,0.055)';


        ctx.beginPath();


        for (

            let x = 0;

            x <=
            canvas.width;

            x += 10

        ) {

            const wave =

                Math.sin(

                    (
                        x *
                        0.018
                    )

                    +

                    (
                        y *
                        0.025
                    )

                )

                *

                2;


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

        Math.min(

            renderer
                .capabilities
                .getMaxAnisotropy(),

            4

        );


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
        256;


    canvas.height =
        256;


    const ctx =
        canvas.getContext(
            '2d'
        );


    ctx.fillStyle =
        '#777777';


    ctx.fillRect(

        0,
        0,

        canvas.width,

        canvas.height

    );


    for (
        let i = 0;
        i < 3500;
        i++
    ) {

        const value =

            90

            +

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
            canvas.width,

            Math.random() *
            canvas.height,

            1

            +

            Math.random() *
            2,

            1

            +

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
// PÉTALOS DE SAKURA
// ============================================================

function createPetals() {

    const positions =
        new Float32Array(

            PETAL_COUNT *
            3

        );


    petalSpeeds =
        new Float32Array(
            PETAL_COUNT
        );


    for (
        let i = 0;
        i < PETAL_COUNT;
        i++
    ) {

        const index =
            i *
            3;


        positions[index] =

            (
                Math.random()

                -

                0.5
            )

            *

            45;


        positions[
            index + 1
        ] =

            Math.random()

            *

            12;


        positions[
            index + 2
        ] =

            (
                Math.random()

                -

                0.5
            )

            *

            45;


        petalSpeeds[i] =

            0.25

            +

            Math.random() *
            0.45;

    }


    petalGeometry =
        new THREE.BufferGeometry();


    petalGeometry.setAttribute(

        'position',

        new THREE.BufferAttribute(

            positions,

            3

        )

    );


    const material =
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


    petals =
        new THREE.Points(

            petalGeometry,

            material

        );


    scene.add(
        petals
    );

}


// ============================================================
// CREAR ENTORNO SAMURÁI
// ============================================================

function initializeSamuraiEnvironment() {

    if (
        environmentReady
    ) {

        return;

    }


    environmentReady =
        true;


    // ========================================================
    // CIELO
    // ========================================================

    const skyTexture =
        createSamuraiSky();


    skyDome =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                400,

                32,

                20

            ),

            new THREE.MeshBasicMaterial({

                map:
                    skyTexture,

                side:
                    THREE.BackSide,

                fog:
                    false

            })

        );


    scene.add(
        skyDome
    );


    // ========================================================
    // MEJORAR PISO
    // ========================================================

    floorMaterial.map =
        createGroundTexture();


    floorMaterial.bumpMap =
        createGroundBump();


    floorMaterial.bumpScale =
        0.10;


    floorMaterial.color.set(
        0xffffff
    );


    floorMaterial.needsUpdate =
        true;


    // ========================================================
    // PÉTALOS
    // ========================================================

    createPetals();


    console.log(

        '✅ Entorno samurái listo.'

    );

}


// ============================================================
// CREAR ENTORNO CUANDO EL NAVEGADOR ESTÉ LIBRE
// ============================================================

function scheduleEnvironmentInitialization() {

    if (
        'requestIdleCallback'
        in
        window
    ) {

        requestIdleCallback(

            initializeSamuraiEnvironment,

            {

                timeout:
                    1200

            }

        );

    }

    else {

        setTimeout(

            initializeSamuraiEnvironment,

            100

        );

    }

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


    floor.position.x =

        Math.floor(

            model.position.x

            /

            FLOOR_RECENTER_STEP

        )

        *

        FLOOR_RECENTER_STEP;


    floor.position.z =

        Math.floor(

            model.position.z

            /

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


    // ========================================================
    // GIRAR IZQUIERDA
    // ========================================================

    if (
        movementKeys.ArrowLeft
    ) {

        turnDirection +=
            1;

    }


    // ========================================================
    // GIRAR DERECHA
    // ========================================================

    if (
        movementKeys.ArrowRight
    ) {

        turnDirection -=
            1;

    }


    // ========================================================
    // ROTACIÓN PROGRESIVA
    // ========================================================

    heading +=

        turnDirection

        *

        TURN_SPEED

        *

        delta;


    let movementDirection =
        0;


    // ========================================================
    // ADELANTE
    // ========================================================

    if (
        movementKeys.ArrowUp
    ) {

        movementDirection =
            1;

    }


    // ========================================================
    // ATRÁS
    // ========================================================

    if (
        movementKeys.ArrowDown
    ) {

        movementDirection =
            -1;

    }


    // ========================================================
    // IZQUIERDA / DERECHA SOLAS
    // ========================================================
    //
    // Sigue caminando mientras da la vuelta.
    // ========================================================

    if (

        turnDirection !== 0

        &&

        movementDirection === 0

    ) {

        movementDirection =
            1;

    }


    // ========================================================
    // ROTAR MODELO
    // ========================================================

    model.rotation.y =

        heading

        +

        MODEL_FORWARD_OFFSET;


    // ========================================================
    // NO HAY MOVIMIENTO
    // ========================================================

    if (
        movementDirection ===
        0
    ) {

        return;

    }


    // ========================================================
    // DIRECCIÓN FRONTAL
    // ========================================================

    forwardDirection
        .set(

            Math.sin(
                heading
            ),

            0,

            Math.cos(
                heading
            )

        )
        .normalize();


    // ========================================================
    // DISTANCIA
    // ========================================================

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
    // MOVER PERSONAJE
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

    if (

        !petals

        ||

        !petalGeometry

    ) {

        return;

    }


    const positions =

        petalGeometry
            .attributes
            .position
            .array;


    const time =

        performance.now()

        *

        0.001;


    for (
        let i = 0;
        i < PETAL_COUNT;
        i++
    ) {

        const index =
            i *
            3;


        // ====================================================
        // CAÍDA
        // ====================================================

        positions[
            index + 1
        ] -=

            petalSpeeds[i]

            *

            delta;


        // ====================================================
        // MOVIMIENTO LATERAL
        // ====================================================

        positions[
            index
        ] +=

            Math.sin(

                time

                +

                i

            )

            *

            0.003;


        // ====================================================
        // REAPARECER ARRIBA
        // ====================================================

        if (

            positions[
                index + 1
            ] < 0

        ) {

            positions[
                index
            ] =

                (
                    Math.random()

                    -

                    0.5
                )

                *

                45;


            positions[
                index + 1
            ] =

                10

                +

                Math.random() *
                4;


            positions[
                index + 2
            ] =

                (
                    Math.random()

                    -

                    0.5
                )

                *

                45;

        }

    }


    petalGeometry
        .attributes
        .position
        .needsUpdate =
        true;


    // ========================================================
    // LOS PÉTALOS SIGUEN AL PERSONAJE
    // ========================================================

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


            // =================================================
            // WALK
            // =================================================
            //
            // Si Walk ya está activo
            // NO se reinicia.
            // =================================================

            playAction(
                'walk'
            );


            return;

        }


        // ====================================================
        // ANIMACIONES 1 - 6
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


            // No cambiamos automáticamente
            // a Stand.
            //
            // Walk puede continuar.

        }

    }

);


// ============================================================
// AL CAMBIAR DE VENTANA
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
// LOOP PRINCIPAL
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
    // MOVIMIENTO
    // ========================================================

    updateCharacterMovement(
        delta
    );


    // ========================================================
    // PISO INFINITO
    // ========================================================

    updateInfiniteFloor();


    // ========================================================
    // PÉTALOS
    // ========================================================

    updatePetals(
        delta
    );


    // ========================================================
    // CIELO SIGUE AL PERSONAJE
    // ========================================================

    if (

        skyDome

        &&

        model

    ) {

        skyDome.position.x =
            model.position.x;


        skyDome.position.z =
            model.position.z;

    }


    // ========================================================
    // CÁMARA
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
// INICIAR LOOP
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

loadCharacterFirst();

scheduleEnvironmentInitialization();