import api from "./axiosInstance";

// damit wird eine leer conversation erstellt ( wenn schon eine existiert wird diese zurückgegeben )
export const startConversation = async (targetId: string) => {
  try {
    const res = await api.post(`/conversation/create/${targetId}`);
    if (res.status === 200) return res.data;
  } catch (error) {
    console.error("Error starting conversation:", error);
  }
};

// das ist die Preview der Konversationen, die nur die letzte Nachricht und den Namen des Gegenübers enthält
export const getConversationList = async () => {
  try {
    const res = await api.get("/conversation/loadPreview");
    console.log("Loaded conversation list:", res);
    if (res.status === 200) return res.data;
  } catch (error) {
    console.error("Error fetching conversation list:", error);
  }
};

// lädt und entschlüsselt eine bestimmte Konversation
export const loadOneConversation = async (conversationId: string) => {
  try {
    const res = await api.get(`/conversation/${conversationId}`);

    if (res.status === 200) return res.data;
    console.log("Loaded conversation:", res);
  } catch (error) {
    console.error("Error loading conversation:", error);
  }
};

// killt Konversationen, für beide (daten werden gelöscht (hard delete))
export const deleteConversation = async (conversationId: string): Promise<string | void> => {
  try {
    const res = await api.delete(`/conversation/${conversationId}`);
    if (res.status === 200) return res.data.message;
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
};
