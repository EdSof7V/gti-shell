"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { createUser } from "@/lib/services/userService";
import { getGroups, Group, assignUserToGroup } from "@/lib/services/groupService";
import { updateUser } from "@/lib/services/authService";
import axios from "axios";

interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  groups: string[];
  role: string;
  disableMfa: boolean;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  mfa_is_required: boolean;
  mfa_is_actived: boolean;
  is_new_user: boolean;
}

interface EmailNotificationRequest {
  email_to: string;
  subject: string;
  link_url: string;
  customer_name: string;
  service_name: string;
}

const steps = [
  { title: "Paso 1", description: "Especificar los detalles del usuario" },
  { title: "Paso 2", description: "Agregar usuario a grupos" },
  { title: "Paso 3", description: "Configuración de seguridad" },
  { title: "Confirmación", description: "Confirma creación de usuarios" },
];

// Departamentos eliminados

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "user", label: "Usuario" },
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Visor" },
];

export default function StepperAddUser() {
  const [currentStep, setCurrentStep] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const methods = useForm<UserFormData>({
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      groups: [],
      role: "",
      disableMfa: false
    },
    mode: "onChange"
  });

  const { handleSubmit, register, watch, formState: { errors, isValid } } = methods;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        setGroupsError(null);
        const fetchedGroups = await getGroups();
        setGroups(fetchedGroups);
      } catch (error: any) {
        console.error("Error al obtener grupos:", error);
        setGroupsError("No se pudieron cargar los grupos. Por favor, inténtelo de nuevo más tarde.");
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  const submitUserData = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      setFormError(null);

      const userRequest: CreateUserRequest = {
        username: data.username,
        email: data.email,
        password: "", 
        first_name: data.firstName,
        last_name: data.lastName,
        mfa_is_required: true, 
        mfa_is_actived: false,
        is_new_user: true 
      };

      const createdUser = await createUser(userRequest);

      setCreatedUserId(createdUser.id);

      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      setFormError(error.response?.data?.message || "Error al crear el usuario. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const assignUserToGroups = async (userId: string, selectedGroups: string[]) => {
    if (!userId || selectedGroups.length === 0) return;

    try {
      setIsSubmitting(true);
      setFormError(null);

      // Realizar asignaciones en paralelo
      const assignmentPromises = selectedGroups.map(groupId =>
        assignUserToGroup(userId, groupId)
      );

      await Promise.all(assignmentPromises);

      console.log(`Usuario ${userId} asignado a ${selectedGroups.length} grupos`);

      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      console.error("Error al asignar usuario a grupos:", error);
      setFormError("Error al asignar usuario a grupos. Por favor, inténtelo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUserMfaSettings = async () => {
    try {
      setIsSubmitting(true);

      if (!createdUserId) {
        setFormError("No se encontró ID de usuario para actualizar configuración MFA");
        return false;
      }

      // Solo hacer la actualización si se ha marcado la opción para deshabilitar MFA
      const disableMfa = watch("disableMfa");

      if (disableMfa) {
        const mfaSettings = {
          mfa_is_required: false
        };

        await updateUser(createdUserId, mfaSettings);
        console.log("MFA deshabilitado para el usuario:", createdUserId);
      } else {
        console.log("MFA permanece habilitado para el usuario:", createdUserId);
      }

      setCurrentStep(currentStep + 1);
      return true;
    } catch (error: any) {
      console.error("Error al actualizar configuración MFA:", error);
      setFormError("Error al actualizar configuración MFA. " + (error.response?.data?.message || "Por favor, inténtelo de nuevo."));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    console.log("Datos del formulario:", data);

    if (currentStep === 0) {
      await submitUserData(data);
    } else if (currentStep === 1 && createdUserId) {
      await assignUserToGroups(createdUserId, data.groups);
    } else if (currentStep === 2) {
      await updateUserMfaSettings();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Formulario completado:", data);
    }
  };

  const handleNext = () => {
    methods.trigger().then((isValid) => {
      if (isValid) {
        handleSubmit(onSubmit)();
      }
    });
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const sendWelcomeEmail = async () => {
    try {
      setIsSubmitting(true);

      const formData = methods.getValues();

      const emailRequest: EmailNotificationRequest = {
        email_to: formData.email,
        subject: "Bienvenido al Sistema - Cuenta Creada Exitosamente",
        link_url: "https://br-gti.vercel.app/",
        customer_name: `${formData.firstName} ${formData.lastName}`,
        service_name: "Administración de Accesos"
      };

      console.log("Enviando solicitud de correo:", emailRequest);

      // Configurar opciones de la solicitud con cabeceras explícitas
      const response = await axios({
        method: 'post',
        url: "https://acloud-br-gcp-gob-ti-msg-1028436318023.southamerica-west1.run.app/api/v1/send-notification",
        data: emailRequest,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log("Respuesta del servidor:", response.data);

      if (response.data && response.data.transaction_id) {
        console.log("Correo enviado exitosamente con ID de transacción:", response.data.transaction_id);
        setEmailSent(true);
      } else {
        throw new Error("La respuesta del servidor no incluye un ID de transacción");
      }
    } catch (error: any) {
      console.error("Error al enviar el correo:", error);

      // Información más detallada del error para debugging
      if (error.response) {
        console.error("Datos de la respuesta de error:", {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        });
        setFormError(`Error del servidor (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error("No se recibió respuesta:", error.request);
        setFormError("No se recibió respuesta del servidor. Por favor, verifica la conectividad de red.");
      } else {
        console.error("Error al configurar la petición:", error.message);
        setFormError(`Error al enviar el correo: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGroupNameById = (groupId: string): string => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : groupId;
  };

  return (
    <div className="mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
      <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
        {steps.map((step, index) => (
          <li key={index} className="mb-10 ms-6">
            <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 ${index <= currentStep ? "bg-green-200 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"}`}>
              {index < currentStep ? (
                <svg className="w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
                </svg>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">{index + 1}</span>
              )}
            </span>
            <h3 className="font-medium leading-tight">{step.title}</h3>
            <p className="text-sm">{step.description}</p>
          </li>
        ))}
      </ol>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-400" role="alert">
              <span className="font-medium">Error:</span> {formError}
            </div>
          )}

          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Nombre de usuario
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  {...register("username", {
                    required: "El nombre de usuario es obligatorio",
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+$/,
                      message: "El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos"
                    }
                  })}
                  className={`bg-gray-50 border ${errors.username ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="john.doe"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Dirección de correo electrónico
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  {...register("email", {
                    required: "El correo electrónico es obligatorio",
                    pattern: {
                      value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
                      message: "Ingrese un correo electrónico válido"
                    }
                  })}
                  className={`bg-gray-50 border ${errors.email ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="john.doe@ejemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Nombres
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  {...register("firstName", {
                    required: "El nombre es obligatorio"
                  })}
                  className={`bg-gray-50 border ${errors.firstName ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Apellidos
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  {...register("lastName", {
                    required: "El apellido es obligatorio"
                  })}
                  className={`bg-gray-50 border ${errors.lastName ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Rol
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register("role", {
                    required: "Seleccione un rol"
                  })}
                  className={`bg-gray-50 border ${errors.role ? "border-red-500" : "border-gray-300"} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                >
                  <option value="">Seleccione un rol</option>
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Grupos
                  <span className="text-red-500 ml-1">*</span>
                </label>

                {isLoadingGroups ? (
                  <div className="flex items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando grupos...</span>
                  </div>
                ) : groupsError ? (
                  <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-400">
                    {groupsError}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    {groups.length === 0 ? (
                      <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">No hay grupos disponibles</p>
                    ) : (
                      groups.map(group => (
                        <div key={group.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`group-${group.id}`}
                            value={group.id}
                            {...register("groups", {
                              required: "Seleccione al menos un grupo"
                            })}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`group-${group.id}`}
                            className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                          >
                            {group.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {errors.groups && (
                  <p className="mt-1 text-sm text-red-500">{errors.groups.message}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Por defecto, todos los usuarios tienen habilitada la autenticación de doble factor (MFA).
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-2">
                  Se enviará un correo electrónico al usuario con instrucciones para establecer su contraseña y activar su cuenta.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disableMfa"
                  {...register("disableMfa")}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="disableMfa"
                  className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Deshabilitar autenticación de múltiples factores (MFA) para este usuario
                </label>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Usuario creado con éxito</h3>

                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full text-left">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Resumen de información:</h4>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-medium">Usuario:</span> {watch("username")}</li>
                    <li><span className="font-medium">Correo:</span> {watch("email")}</li>
                    <li><span className="font-medium">Nombre completo:</span> {watch("firstName")} {watch("lastName")}</li>
                    <li><span className="font-medium">Rol:</span> {roleOptions.find(r => r.value === watch("role"))?.label || watch("role")}</li>
                    <li>
                      <span className="font-medium">Grupos:</span> {watch("groups")?.length > 0
                        ? watch("groups").map(groupId => getGroupNameById(groupId)).join(", ")
                        : "Ninguno"}
                    </li>
                    <li><span className="font-medium">MFA requerido:</span> {watch("disableMfa") ? "No" : "Sí"}</li>
                    {createdUserId && <li><span className="font-medium">ID de usuario:</span> {createdUserId}</li>}
                  </ul>
                </div>

                <div className="w-full mt-6">
                  {!emailSent ? (
                    <button
                      type="button"
                      onClick={sendWelcomeEmail}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando correo...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                            <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                            <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                          </svg>
                          Enviar correo de bienvenida
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                          <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
                          <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
                        </svg>
                        <span>Correo enviado exitosamente a <strong>{watch("email")}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </FormProvider>

      <div className="col-span-1 md:col-span-2 flex justify-between mt-6">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          onClick={handlePrev}
          disabled={currentStep === 0 || isSubmitting}
        >
          Anterior
        </button>

        {currentStep < steps.length - 1 ? (
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              </>
            ) : (
              'Siguiente'
            )}
          </button>
        ) : (
          <button
            type="button"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => window.location.href = "/admin/users"}
          >
            Volver a usuarios
          </button>
        )}
      </div>
    </div>
  );
}