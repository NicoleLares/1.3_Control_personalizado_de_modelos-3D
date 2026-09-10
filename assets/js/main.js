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
// VARIABLES GENERALES
// ============================================================

const loader = new FBXLoader();

const clock = new THREE.Clock();

const actions = {};


let model;

let mixer;

let currentAction = null;

let currentAnimationName = null;


// ============================================================
// CONFIGURACIÓN DE MOVIMIENTO
// ============================================================

// Velocidad del personaje
const MOVE_SPEED = 2.5;


// Velocidad con la que gira
const TURN_SPEED = 10;


// Límite de movimiento dentro del suelo
const MOVEMENT_LIMIT = 9;


// Si el personaje camina de espaldas,
// cambia 0 por Math.PI
const MODEL_FORWARD_OFFSET = 0;


// Dirección actual
const moveDirection =
    new THREE.Vector3();


// ============================================================
// ESTADO DE LAS FLECHAS
// ============================================================

const movementKeys = {

    ArrowUp: false,

    ArrowDown: false,

    ArrowLeft: false,

    ArrowRight: false

};


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
// NOMBRES DE LAS ANIMACIONES
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
// CARGAR UNA ANIMACIÓN
// ============================================================

function loadAnimation(name, url) {

    return new Promise(
        (resolve, reject) => {

            loader.load(

                url,

                (fbx) => {

                    // Verificamos que exista
                    // al menos una animación
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


                    // Primer clip
                    const clip =
                        fbx.animations[0];


                    // Crear acción
                    const action =
                        mixer.clipAction(clip);


                    // ====================================================
                    // REPETICIÓN CONTINUA
                    // ====================================================

                    action.setLoop(
                        THREE.LoopRepeat,
                        Infinity
                    );


                    action.clampWhenFinished =
                        false;


                    action.enabled =
                        true;


                    // Guardar
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

        }
    );

}


// ============================================================
// CAMBIAR DE ANIMACIÓN
// ============================================================

function playAction(name) {

    const nextAction =
        actions[name];


    if (!nextAction) {

        console.warn(
            `No existe la animación: ${name}`
        );

        return;

    }


    // ========================================================
    // SI YA ESTÁ REPRODUCIÉNDOSE
    // ========================================================
    //
    // NO hacemos reset.
    //
    // Ejemplo:
    //
    // Walk -> flecha izquierda -> sigue Walk
    //
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


        updateAnimationName(
            name
        );


        return;

    }


    // ========================================================
    // OBTENER PROGRESO DE ANIMACIÓN ACTUAL
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
    // PREPARAR NUEVA ANIMACIÓN
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


    // Mantener aproximadamente
    // el mismo progreso
    nextAction.time =

        progress *

        nextClip.duration;


    nextAction.play();


    // ========================================================
    // TRANSICIÓN SUAVE
    // ========================================================

    nextAction.crossFadeFrom(
        currentAction,
        0.30,
        true
    );


    // Nueva animación actual
    currentAction =
        nextAction;


    currentAnimationName =
        name;


    updateAnimationName(
        name
    );

}


// ============================================================
// ACTUALIZAR NOMBRE EN LA INTERFAZ
// ============================================================

function updateAnimationName(name) {

    const element =
        document.getElementById(
            'animation-name'
        );


    if (!element) {

        return;

    }


    element.textContent =

        animationLabels[name]

        ||

        name.toUpperCase();

}


// ============================================================
// MOVIMIENTO DEL PERSONAJE
// ============================================================

function updateCharacterMovement(delta) {

    if (!model) {

        return;

    }


    // Reiniciar dirección
    moveDirection.set(
        0,
        0,
        0
    );


    // ========================================================
    // IZQUIERDA
    // ========================================================

    if (
        movementKeys.ArrowLeft
    ) {

        moveDirection.x -= 1;

    }


    // ========================================================
    // DERECHA
    // ========================================================

    if (
        movementKeys.ArrowRight
    ) {

        moveDirection.x += 1;

    }


    // ========================================================
    // ADELANTE
    // ========================================================

    if (
        movementKeys.ArrowUp
    ) {

        moveDirection.z -= 1;

    }


    // ========================================================
    // ATRÁS
    // ========================================================

    if (
        movementKeys.ArrowDown
    ) {

        moveDirection.z += 1;

    }


    // Si no hay flecha presionada,
    // simplemente no desplazamos al personaje.
    //
    // MUY IMPORTANTE:
    // aquí NO cambiamos su animación.
    if (
        moveDirection.lengthSq() === 0
    ) {

        return;

    }


    // Evitar mayor velocidad diagonal
    moveDirection.normalize();


    // ========================================================
    // DESPLAZAR PERSONAJE
    // ========================================================

    model.position.x +=

        moveDirection.x *

        MOVE_SPEED *

        delta;


    model.position.z +=

        moveDirection.z *

        MOVE_SPEED *

        delta;


    // ========================================================
    // LÍMITES DEL ESCENARIO
    // ========================================================

    model.position.x =

        THREE.MathUtils.clamp(
            model.position.x,
            -MOVEMENT_LIMIT,
            MOVEMENT_LIMIT
        );


    model.position.z =

        THREE.MathUtils.clamp(
            model.position.z,
            -MOVEMENT_LIMIT,
            MOVEMENT_LIMIT
        );


    // ========================================================
    // GIRAR HACIA LA DIRECCIÓN DEL MOVIMIENTO
    // ========================================================

    const targetRotation =

        Math.atan2(
            moveDirection.x,
            moveDirection.z
        )

        +

        MODEL_FORWARD_OFFSET;


    // Diferencia de ángulo
    let rotationDifference =

        targetRotation

        -

        model.rotation.y;


    // Normalizar entre -PI y PI
    rotationDifference =

        Math.atan2(
            Math.sin(
                rotationDifference
            ),
            Math.cos(
                rotationDifference
            )
        );


    // Giro suave
    model.rotation.y +=

        rotationDifference

        *

        Math.min(
            1,
            TURN_SPEED * delta
        );

}


// ============================================================
// CARGAR MODELO PRINCIPAL
// ============================================================

loader.load(

    './assets/models/character.fbx',

    async (fbx) => {

        model =
            fbx;


        // Escala
        model.scale.setScalar(
            0.01
        );


        // Posición inicial
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


        // ====================================================
        // ANIMATION MIXER
        // ====================================================

        mixer =
            new THREE.AnimationMixer(
                model
            );


        // ====================================================
        // CARGAR TODAS LAS ANIMACIONES
        // ====================================================

        try {

            await Promise.all(

                Object
                    .entries(
                        animationFiles
                    )
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

            playAction(
                'stand'
            );

        }

        catch (error) {

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
// TECLADO - KEYDOWN
// ============================================================

window.addEventListener(
    'keydown',

    (event) => {

        // ====================================================
        // FLECHAS
        // ====================================================

        if (
            event.code in movementKeys
        ) {

            event.preventDefault();


            // Activar movimiento
            movementKeys[event.code] =
                true;


            // =================================================
            // IMPORTANTE
            // =================================================
            //
            // Las flechas hacen que el personaje camine.
            //
            // Si YA está en Walk:
            // playAction detectará que es la misma acción
            // y NO hará reset.
            //
            // Por lo tanto Walk continuará exactamente
            // donde iba.
            // =================================================

            playAction(
                'walk'
            );


            return;

        }


        // ====================================================
        // NÚMEROS
        // ====================================================

        const keyboard = {

            // 1
            Digit1:
                'dagger',

            // 2
            Digit2:
                'jumping',

            // 3
            Digit3:
                'punching',

            // 4
            Digit4:
                'stand',

            // 5
            Digit5:
                'uppercut',

            // 6
            Digit6:
                'walk'

        };


        const animation =
            keyboard[event.code];


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
// TECLADO - KEYUP
// ============================================================

window.addEventListener(
    'keyup',

    (event) => {

        if (
            event.code in movementKeys
        ) {

            event.preventDefault();


            // Detenemos solamente
            // el DESPLAZAMIENTO
            movementKeys[event.code] =
                false;


            // =================================================
            // IMPORTANTE
            // =================================================
            //
            // NO usamos:
            //
            // playAction('stand');
            //
            // Por lo tanto, cuando soltamos la flecha:
            //
            // Walk continúa reproduciéndose.
            //
            // =================================================

        }

    }

);


// ============================================================
// SI LA VENTANA PIERDE EL FOCO
// ============================================================

window.addEventListener(
    'blur',

    () => {

        // Detener solamente
        // el desplazamiento

        movementKeys.ArrowUp =
            false;

        movementKeys.ArrowDown =
            false;

        movementKeys.ArrowLeft =
            false;

        movementKeys.ArrowRight =
            false;


        // NO cambiamos a Stand.
        //
        // La animación actual continúa.

    }

);


// ============================================================
// CICLO PRINCIPAL
// ============================================================

function animate() {

    const delta =
        clock.getDelta();


    // ========================================================
    // ACTUALIZAR ANIMACIÓN
    // ========================================================

    if (
        mixer
    ) {

        mixer.update(
            delta
        );

    }


    // ========================================================
    // ACTUALIZAR POSICIÓN
    // ========================================================

    updateCharacterMovement(
        delta
    );


    // OrbitControls
    controls.update();


    // Renderizar
    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// INICIAR CICLO
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