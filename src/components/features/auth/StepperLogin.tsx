"use client";
import { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import MFAQRCode from "../auth/MFAQRCode";
import { generateMFASecret, verifyMFACode, verifyMFASetup } from "@/lib/services/mfaService";
import { validateUsername, updateUser, UpdateUserRequest, updateNewUserPassword } from "@/lib/services/authService";
import PasswordRequirementsTooltip from "./PasswordRequirementsTooltip";
import { getAuthToken } from "@/lib/services/authTokenService";
import { useSession } from "@/context/SessionContext";
import Cookies from "js-cookie";

interface User {
    id?: string;
    username: string;
    password: string;
    requiresMFA: boolean;
    hasMFAConfigured: boolean;
    isNewUser?: boolean;
}

interface FormData {
    username: string;
    password?: string;
    newPassword?: string;
    confirmPassword?: string;
    mfaCode?: string;
    showPassword?: boolean;
}

interface MFASetupData {
    username: string;
    secret: string;
    uri: string;
}

export default function StepperLogin() {
    const [step, setStep] = useState<"username" | "password" | "setPassword" | "mfa" | "setupMFA">("username");
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        lowercase: false,
        uppercase: false,
        number: false,
        special: false
    });
    const [mfaSetupData, setMfaSetupData] = useState<MFASetupData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showTooltip, setShowTooltip] = useState<boolean>(false);
    const [authToken, setAuthToken] = useState<any>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { setSession } = useSession();

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>();
    const newPassword = watch("newPassword", "");

    // Función para autenticar con token y manejar el resultado
    const authenticateWithToken = async (username: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const tokenResponse = await getAuthToken(username, password);
            setAuthToken(tokenResponse);

            // Guardar en el contexto de sesión
            setSession({
                username: username,
                accessToken: tokenResponse.access_token,
                scope: tokenResponse.scope || '',
                isAuthenticated: true
            });

            // Guardar el token como cookie
            Cookies.set('auth_token', tokenResponse.access_token, {
                secure: true,
                sameSite: 'Strict',
                path: '/',
            });

            return true;
        } catch (error: any) {
            setError("Credenciales incorrectas o problema de autenticación");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleNextStep: SubmitHandler<FormData> = async (data) => {
        setError("");
        setLoading(true);

        try {
            if (step === "username") {
                try {
                    const validationResponse = await validateUsername(data.username);
                    
                    // Crear un objeto de usuario con los datos de la validación
                    const validatedUser: User = {
                        id: validationResponse.id,
                        username: data.username,
                        password: "",
                        requiresMFA: validationResponse.exists ? validationResponse.mfa_is_required : false,
                        hasMFAConfigured: validationResponse.exists ? validationResponse.mfa_is_actived : false,
                        isNewUser: validationResponse.exists ? validationResponse.is_new_user : false
                    };

                    setUser(validatedUser);

                    // Determinar el siguiente paso
                    if (validationResponse.exists && validationResponse.is_new_user) {
                        setStep("setPassword");
                    } else {
                        setStep("password");
                    }
                } catch (error: any) {
                    setError("Error al validar el usuario");
                    setLoading(false);
                }
            }
            else if (step === "password" && user) {
                try {
                    // Autenticar con el endpoint de token
                    const authSuccess = await authenticateWithToken(user.username, data.password || "");

                    if (!authSuccess) {
                        setLoading(false);
                        return;
                    }

                    // Verificar si requiere MFA
                    if (user.requiresMFA) {
                        if (!user.hasMFAConfigured) {
                            try {
                                // Generar secreto MFA para el usuario
                                const mfaData = await generateMFASecret(user.username);
                                setMfaSetupData(mfaData);
                                setStep("setupMFA");
                            } catch (error: any) {
                                setError("Error al generar configuración MFA");
                            }
                        } else {
                            setStep("mfa");
                        }
                    } else {
                        // Si no requiere MFA, redirigir al dashboard
                        router.push("/dashboard");
                        resetForm();
                    }
                } catch (error: any) {
                    setError("Error al procesar la autenticación");
                    setLoading(false);
                }
            }
            else if (step === "setPassword" && user) {
                // Verificar que el usuario sea realmente nuevo
                if (user.isNewUser === false) {
                    setError("Esta operación solo está permitida para usuarios nuevos");
                    setLoading(false);
                    return;
                }

                if (data.newPassword !== data.confirmPassword) {
                    setError("Las contraseñas no coinciden");
                    setLoading(false);
                    return;
                }

                if (data.newPassword && !validatePasswordComplexity(data.newPassword)) {
                    setError("La contraseña no cumple con los requisitos mínimos");
                    setLoading(false);
                    return;
                }

                try {
                    if (user.id) {
                        const updatedUser = await updateNewUserPassword(user.id, data.newPassword || "");

                        // Autenticar con el nuevo usuario y contraseña
                        const authSuccess = await authenticateWithToken(user.username, data.newPassword || "");

                        if (!authSuccess) {
                            setError("La contraseña se actualizó pero hubo un problema al iniciar sesión");
                            setLoading(false);
                            return;
                        }

                        // Actualizamos el estado local del usuario
                        setUser({
                            ...user,
                            password: data.newPassword || "",
                            isNewUser: false
                        });

                        // Verificar si requiere MFA
                        if (user.requiresMFA) {
                            try {
                                const mfaData = await generateMFASecret(user.username);
                                setMfaSetupData(mfaData);
                                setStep("setupMFA");
                            } catch (error: any) {
                                setError("Error al generar configuración MFA");
                            }
                        } else {
                            router.push("/dashboard");
                            resetForm();
                        }
                    } else {
                        setError("No se pudo identificar al usuario correctamente");
                        setLoading(false);
                    }
                } catch (error: any) {
                    setError("Error al actualizar la contraseña");
                    setLoading(false);
                }
            }
            else if (step === "setupMFA" && user && mfaSetupData) {
                try {
                    // Verificar el código MFA ingresado
                    const result = await verifyMFASetup(
                        mfaSetupData.username,
                        data.mfaCode || "",
                        mfaSetupData.secret
                    );

                    if (result.success) {
                        // Si la verificación fue exitosa, actualizar atributo mfa_is_actived
                        if (user.id) {
                            try {
                                // Crear un objeto que solo contenga el campo mfa_is_actived
                                const updateData: UpdateUserRequest = {
                                    mfa_is_actived: true
                                };

                                // Llamar al endpoint para actualizar únicamente este campo
                                const updatedUser = await updateUser(user.id, updateData);

                                // Actualizar el usuario local
                                user.hasMFAConfigured = true;

                                // Redireccionar al dashboard
                                router.push("/dashboard");
                                resetForm();
                            } catch (error: any) {
                                setError("Error al activar MFA");
                                setLoading(false);
                            }
                        } else {
                            setError("No se pudo identificar al usuario para activar MFA");
                            setLoading(false);
                        }
                    } else {
                        setError(result.message || "Código MFA inválido");
                        setLoading(false);
                    }
                } catch (error: any) {
                    setError("Error al verificar código MFA");
                    setLoading(false);
                }
            }
            else if (step === "mfa" && user) {
                try {
                    const result = await verifyMFACode(user.username, data.mfaCode || "");

                    if (result.success) {
                        router.push("/dashboard");
                        resetForm();
                    } else {
                        if (result.status && result.status !== "success") {
                            setError(`Verificación fallida: ${result.status}`);
                        } else {
                            setError(result.message || "Código MFA incorrecto");
                        }
                    }
                } catch (error: any) {
                    setError("Error al verificar código MFA");
                }
            }
        } catch (error: any) {
            setError(error.message || "Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const validatePasswordComplexity = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,64}$/;
        return regex.test(password);
    };

    useEffect(() => {
        if (newPassword) {
            setPasswordValidation({
                length: newPassword.length >= 8 && newPassword.length <= 64,
                lowercase: /[a-z]/.test(newPassword),
                uppercase: /[A-Z]/.test(newPassword),
                number: /[0-9]/.test(newPassword),
                special: /[^a-zA-Z0-9]/.test(newPassword)
            });
        } else {
            setPasswordValidation({
                length: false,
                lowercase: false,
                uppercase: false,
                number: false,
                special: false
            });
        }
    }, [newPassword]);

    const resetForm = () => {
        setStep("username");
        setUser(null);
        setMfaSetupData(null);
        setAuthToken(null);
        reset();
    };

    return (
        <div className="max-w-sm mx-auto">
            <h2 className="text-4xl font-extrabold dark:text-white pb-8">Iniciar sesión</h2>
            {error && (
                <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-400" role="alert">
                    <span className="font-medium">Error:</span> {error}
                </div>
            )}
            <form onSubmit={handleSubmit(handleNextStep)} className="max-w-sm mx-auto">
                {/* PASO 1: Entrada de usuario */}
                {step === "username" && (
                    <div className="mb-5">
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre de usuario</label>
                        <input
                            {...register("username", { required: "El usuario es obligatorio" })}
                            type="text"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
                    </div>
                )}

                {/* PASO 2A: Entrada de contraseña para usuario existente */}
                {step === "password" && (
                    <div className="mb-5">
                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario:</label>
                            <p className="text-blue-600 font-medium dark:text-blue-400">{user?.username}</p>
                        </div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                        <input
                            {...register("password", { required: "La contraseña es obligatoria" })}
                            type={showPassword ? "text" : "password"}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

                        <div className="flex items-start mt-3 mb-5">
                            <input
                                id="showPassword"
                                type="checkbox"
                                onChange={() => setShowPassword(!showPassword)}
                                className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            />
                            <label htmlFor="showPassword" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Mostrar contraseña
                            </label>
                        </div>
                    </div>
                )}

                {/* PASO 2B: Configuración de contraseña para nuevo usuario */}
                {step === "setPassword" && (
                    <>
                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario:</label>
                            <p className="text-blue-600 font-medium dark:text-blue-400">{user?.username}</p>
                        </div>

                        {user?.isNewUser && (
                            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" role="alert">
                                <span className="font-medium">Información:</span> Es la primera vez que inicias sesión. Por favor, crea una contraseña nueva.
                            </div>
                        )}

                        <div className="mb-5 relative">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nueva contraseña</label>
                            <div className="relative">
                                <input
                                    {...register("newPassword", {
                                        required: "La contraseña es obligatoria",
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,64}$/,
                                            message: "Debe contener entre 8-64 caracteres, letras mayúsculas, minúsculas, números y caracteres no alfanuméricos"
                                        }
                                    })}
                                    type={showPassword ? "text" : "password"}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    onFocus={() => setShowTooltip(true)}
                                    onBlur={() => setShowTooltip(false)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                                    onClick={() => setShowTooltip(!showTooltip)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>

                                {showTooltip && (
                                    <PasswordRequirementsTooltip
                                        passwordValidation={passwordValidation}
                                        tooltipRef={tooltipRef}
                                    />
                                )}
                            </div>
                            {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
                        </div>
                        <div className="mb-5">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirmar contraseña</label>
                            <input
                                {...register("confirmPassword", {
                                    required: "Debe confirmar la contraseña",
                                    validate: value => value === newPassword || "Las contraseñas no coinciden"
                                })}
                                type={showPassword ? "text" : "password"}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="flex items-start mb-5">
                            <input
                                id="showPassword"
                                type="checkbox"
                                onChange={() => setShowPassword(!showPassword)}
                                className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                            />
                            <label htmlFor="showPassword" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Mostrar contraseña
                            </label>
                        </div>
                    </>
                )}

                {/* PASO 3A: Configurar MFA por primera vez */}
                {step === "setupMFA" && mfaSetupData && (
                    <div className="mb-5">
                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario:</label>
                            <p className="text-blue-600 font-medium dark:text-blue-400">{user?.username}</p>
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Configurar autenticación de dos factores</h3>
                        <p className="mb-4 text-sm text-gray-700 dark:text-gray-400">Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Microsoft Authenticator o Authy).</p>

                        <div className="mx-auto flex flex-col items-center mb-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
                            <MFAQRCode uri={mfaSetupData.uri} size={250} />
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-400 mb-4">Una vez escaneado, ingresa el código generado por la aplicación:</p>

                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Código de verificación</label>
                            <input
                                {...register("mfaCode", {
                                    required: "El código es obligatorio",
                                    pattern: {
                                        value: /^\d{6}$/,
                                        message: "El código debe ser de 6 dígitos"
                                    }
                                })}
                                type="text"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Ingresa el código de 6 dígitos"
                                maxLength={6}
                            />
                            {errors.mfaCode && <p className="text-red-500 text-sm mt-1">{errors.mfaCode.message}</p>}
                        </div>
                    </div>
                )}

                {/* PASO 3B: Validar código MFA */}
                {step === "mfa" && (
                    <div className="mb-5">
                        <div className="mb-3">
                            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de usuario:</label>
                            <p className="text-blue-600 font-medium dark:text-blue-400">{user?.username}</p>
                        </div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Código de verificación</label>
                        <input
                            {...register("mfaCode", {
                                required: "El código es obligatorio",
                                pattern: {
                                    value: /^\d{6}$/,
                                    message: "El código debe ser de 6 dígitos"
                                }
                            })}
                            type="text"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Ingresa el código de 6 dígitos"
                            maxLength={6}
                        />
                        {errors.mfaCode && <p className="text-red-500 text-sm mt-1">{errors.mfaCode.message}</p>}
                        <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">Ingresa el código generado por tu aplicación de autenticación.</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                        </div>
                    ) : (
                        step === "mfa" || step === "setupMFA" ? "Verificar" : "Siguiente"
                    )}
                </button>
            </form>
        </div>
    );
}