import { useQuery } from "@tanstack/react-query";

export interface GetWordsDataType {}

export interface GetWordsResponse {
  time: {
    requestTime: number;
    responseTime: number;
  };
  data: GetWordsDataType[];
}

type GetWordsParams = {
  enabled?: boolean;
};

const useGetWords = (params?: GetWordsParams) => {
  const { enabled = true } = params || {};

  // 1️⃣ 실제 fetch url을 수정하세요
  const fetchGetWords = async (): Promise<GetWordsResponse> => {
    const url = "/api/notion";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch GetWords ");
    }

    return response.json();
  };

  const query = useQuery<GetWordsResponse, Error>({
    queryKey: ["get-words"],
    queryFn: fetchGetWords,
    enabled: enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    getWordsData: query.data,
    getWordsIsLoading: query.isLoading,
    getWordsIsError: query.isError,
    getWordsIsSuccess: query.isSuccess,
    getWordsRefetch: query.refetch,
    getWordsError: query.error,
    getWords: query.data?.data ?? [],
  };
};

export default useGetWords;
