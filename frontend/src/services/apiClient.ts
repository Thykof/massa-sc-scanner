import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const fetchFile = async (address: string): Promise<Blob> => {
  const response = await axios.get(`${address}/download`, {
    responseType: 'blob',
  });

  return response.data;
};
