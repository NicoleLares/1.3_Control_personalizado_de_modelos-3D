import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';


// ============================================================
// ESCENA
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07111f);


// ============================================================
// CÁMARA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(5, 3.5, 7);


// ============================================================
// RENDERIZADOR
// ============================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


document
    .getElementById('scene-container')
    .appendChild(renderer.domElement);


// ============================================================
// CONTROLES DE CÁMARA
// ============================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.target.set(
    0,
    1,
    0
);


// ============================================================
// ILUMINACIÓN
// ============================================================

const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0x223344,
    1.8
);

scene.add(hemiLight);


const mainLight = new THREE.DirectionalLight(
    0xffffff,
    3
);

mainLight.position.set(
    5,
    10,
    6
);

mainLight.castShadow = true;

mainLight.shadow.mapSize.set(
    2048,
    2048
);

scene.add(mainLight);


// ============================================================
// SUELO
// ============================================================

const floor = new THREE.Mesh(

    new THREE.PlaneGeometry(
        20,
        20
    ),

    new THREE.MeshStandardMaterial({
        color: 0x263445,
        roughness: 0.9
    })

);

floor.rotation.x =
    -Math.PI / 2;

floor.receiveShadow = true;

scene.add(floor);


// ============================================================
// CUADRÍCULA
// ============================================================

const grid = new THREE.GridHelper(
    20,
    20,
    0x7dd3fc,
    0x475569
);

scene.add(grid);


// ============================================================
// VARIABLES
// ============================================================

const loader = new FBXLoader();

const clock = new THREE.Clock();


// Aquí se guardarán todas las animaciones
const actions = {};


// Modelo
let model;


// Controlador de animaciones
let mixer;


// Animación que se está reproduciendo actualmente
let currentAction = null;


// Nombre de la animación actual
let currentAnimationName = null;


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
        './assets/models/animations/Uppercut.fbx'

};


// ============================================================
// NOMBRES QUE SE MOSTRARÁN EN PANTALLA
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
        'UPPERCUT'

};


// ============================================================
// CARGAR ANIMACIÓN
// ============================================================

function loadAnimation(name, url) {

    return new Promise(
        (resolve, reject) => {

            loader.load(

                url,

                (fbx) => {

                    // Verificamos que el archivo tenga animación
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


                    // Obtenemos el primer clip
                    const clip =
                        fbx.animations[0];


                    // Creamos la acción
                    const action =
                        mixer.clipAction(clip);


                    // ----------------------------------------------------
                    // IMPORTANTE:
                    // La animación se repetirá indefinidamente.
                    // ----------------------------------------------------

                    action.setLoop(
                        THREE.LoopRepeat,
                        Infinity
                    );


                    action.clampWhenFinished =
                        false;


                    action.enabled =
                        true;


                    // Guardamos la acción
                    actions[name] =
                        action;


                    console.log(
                        `Animación cargada correctamente: ${name}`
                    );


                    resolve();

                },

                undefined,

                (error) => {

                    console.error(
                        `Error cargando la animación ${name}:`,
                        error
                    );

                    reject(error);

                }

            );

        }
    );

}


// ============================================================
// CAMBIAR / REPRODUCIR ANIMACIÓN
// ============================================================

function playAction(name) {

    const nextAction =
        actions[name];


    // Si no existe, salir
    if (!nextAction) {

        console.warn(
            `No existe la animación: ${name}`
        );

        return;

    }


    // ========================================================
    // SI SE PRESIONA LA MISMA ANIMACIÓN
    // ========================================================
    //
    // No hacemos reset.
    //
    // Esto significa que si presionas nuevamente la misma
    // tecla, el movimiento NO comenzará desde cero.
    // Continuará normalmente.
    // ========================================================

    if (
        currentAction === nextAction
    ) {

        return;

    }


    // ========================================================
    // PRIMERA ANIMACIÓN
    // ========================================================

    if (!currentAction) {

        nextAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .play();


        currentAction =
            nextAction;


        currentAnimationName =
            name;


        updateAnimationName(name);


        return;

    }


    // ========================================================
    // GUARDAMOS EL PROGRESO DE LA ANIMACIÓN ACTUAL
    // ========================================================

    const currentClip =
        currentAction.getClip();


    let progress = 0;


    if (
        currentClip.duration > 0
    ) {

        progress =
            (
                currentAction.time %
                currentClip.duration
            )
            /
            currentClip.duration;

    }


    // ========================================================
    // PREPARAMOS LA NUEVA ANIMACIÓN
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


    // --------------------------------------------------------
    // Intentamos mantener aproximadamente el mismo porcentaje
    // del movimiento anterior.
    //
    // Esto ayuda a que la transición sea menos brusca.
    // --------------------------------------------------------

    nextAction.time =
        progress *
        nextClip.duration;


    // Comenzamos la nueva animación
    nextAction.play();


    // ========================================================
    // TRANSICIÓN SUAVE
    // ========================================================
    //
    // Mezcla la animación anterior con la nueva durante
    // 0.35 segundos.
    //
    // De esta forma NO se corta bruscamente el personaje.
    // ========================================================

    nextAction.crossFadeFrom(
        currentAction,
        0.35,
        true
    );


    // Guardamos la nueva acción como actual
    currentAction =
        nextAction;


    currentAnimationName =
        name;


    // Actualizamos texto en pantalla
    updateAnimationName(name);

}


// ============================================================
// ACTUALIZAR NOMBRE DE ANIMACIÓN
// ============================================================

function updateAnimationName(name) {

    const element =
        document.getElementById(
            'animation-name'
        );


    if (!element) return;


    element.textContent =
        animationLabels[name] ||
        name.toUpperCase();

}


// ============================================================
// CARGAR PERSONAJE
// ============================================================

loader.load(

    './assets/models/character.fbx',

    async (fbx) => {

        // Guardamos modelo
        model =
            fbx;


        // Tamaño
        model.scale.setScalar(
            0.01
        );


        // Posición
        model.position.set(
            0,
            0,
            0
        );


        // ====================================================
        // SOMBRAS
        // ====================================================

        model.traverse(
            (child) => {

                if (child.isMesh) {

                    child.castShadow =
                        true;

                    child.receiveShadow =
                        true;

                }

            }
        );


        // Agregamos a escena
        scene.add(model);


        // ====================================================
        // CREAMOS EL ANIMATION MIXER
        // ====================================================

        mixer =
            new THREE.AnimationMixer(
                model
            );


        // ====================================================
        // CARGAMOS TODAS LAS ANIMACIONES
        // ====================================================

        try {

            await Promise.all(

                Object
                    .entries(animationFiles)
                    .map(

                        ([name, url]) =>

                            loadAnimation(
                                name,
                                url
                            )

                    )

            );


            console.log(
                'Todas las animaciones fueron cargadas.'
            );


            // =================================================
            // ANIMACIÓN INICIAL
            // =================================================
            //
            // Antes tenías "idle", pero no tienes Idle.fbx.
            // Por eso usamos Stand.
            // =================================================

            playAction(
                'stand'
            );

        }

        catch (error) {

            console.error(
                'Error cargando las animaciones:',
                error
            );

        }

    },

    undefined,

    (error) => {

        console.error(
            'Error al cargar character.fbx:',
            error
        );

    }

);


// ============================================================
// CONTROLES DEL TECLADO
// ============================================================

window.addEventListener(
    'keydown',

    (event) => {

        const keyboard = {

            // 1 = Double Dagger
            Digit1:
                'dagger',

            // 2 = Jumping
            Digit2:
                'jumping',

            // 3 = Punching
            Digit3:
                'punching',

            // 4 = Stand
            Digit4:
                'stand',

            // 5 = Uppercut
            Digit5:
                'uppercut'

        };


        const animation =
            keyboard[event.code];


        if (animation) {

            playAction(
                animation
            );

        }

    }

);


// ============================================================
// CICLO PRINCIPAL
// ============================================================

function animate() {

    // Tiempo transcurrido desde el frame anterior
    const delta =
        clock.getDelta();


    // ========================================================
    // ACTUALIZAR ANIMACIONES
    // ========================================================
    //
    // Esto es lo que permite que la animación siga
    // reproduciéndose continuamente.
    // ========================================================

    if (mixer) {

        mixer.update(
            delta
        );

    }


    // Actualizar OrbitControls
    controls.update();


    // Render
    renderer.render(
        scene,
        camera
    );

}


// Ejecutar ciclo
renderer.setAnimationLoop(
    animate
);


// ============================================================
// AJUSTE RESPONSIVE
// ============================================================

window.addEventListener(
    'resize',

    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }

);