import api from "./axiosInstance";

export const sendMessage = async (conversationId: string, FormData: FormData) => {
  try {
    const res = await api.post(`/chat/send/${conversationId}`, FormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (res.status === 200) return res.data;
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// updates werden nur in den ersten 5min nach erstellen der Nachricht akzeptiert
export const updateMessage = async (messageId: string, FormData: FormData) => {
  try {
    const res = await api.post(`/chat/update/${messageId}`, FormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.status === 200) return res.data;
  } catch (error) {
    console.error("Error updating message:", error);
  }
};

// das ist ein 'lösch' zustand der abhängig von dem sender ist, löscht der sender die Nachricht wird der Content gelöscht
// sonst wird die Nachricht nur als gelöscht markiert (und dann ausgeblendet)
export const deleteMessage = async (messageId: string) => {
  try {
    await api.delete(`/chat/${messageId}`);
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};
