import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const fetchFile = async (
  address: string,
  path: string,
  chainIdString: string,
): Promise<Blob> => {
  const response = await axios.get(
    `${apiClient.getUri()}${address}/${path}?chainIdString=${chainIdString}`,
    {
      responseType: 'blob',
    },
  );

  return response.data;
};
