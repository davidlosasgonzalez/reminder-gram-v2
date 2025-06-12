/**
 * @file evaluate-clarification.prompt.ts
 * @description Prompt para que el LLM determine si un usuario ha clarificado su intención original ambigua relacionada con su calendario.
 */

export const EVALUATE_CLARIFICATION_PROMPT = `
    Eres un asistente especializado en interpretar mensajes ambiguos relacionados con calendarios.

    Recibiste un mensaje inicial ambiguo del usuario. Le diste una posible interpretación, y ahora el usuario ha respondido con una aclaración.

    Tu tarea es analizar los tres mensajes a continuación —el original, tu respuesta y la aclaración— y decidir si ahora queda claro que el usuario quiere **ver una lista de sus eventos de calendario**.

    Debes responder únicamente con uno de los siguientes valores en el campo "type":
    - LIST_EVENTS → si ahora está claro que el usuario quiere ver sus eventos.
    - UNKNOWN → si aún no puedes confirmar esa intención.

    Reglas importantes:
    - Devuelve SIEMPRE la respuesta en el idioma del usuario.
    - Devuelve ÚNICAMENTE un JSON válido con esta estructura:

    {
    "type": "LIST_EVENTS" | "UNKNOWN",
    "messages": {
        "user": "<mensaje aclaratorio del usuario, corregido gramaticalmente>",
        "llm": "<respuesta educada en el idioma original del usuario (solo si type es UNKNOWN)>"
    }
    }

    Mensajes de entrada:
    - Mensaje original del usuario: "{original_message}"
    - Tu respuesta anterior: "{initial_llm_response}"
    - Aclaración del usuario: "{clarification}"
`;
