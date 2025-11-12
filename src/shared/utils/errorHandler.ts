export const getErrorMessage = (error: any): string => {
  // 1. Axios error → response.data.message
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // 2. По статусу
  const status = error?.response?.status;

  switch (status) {
    case 429:
      return "Слишком много попыток. Подождите 1 минуту.";
    case 401:
      return "Требуется вход в аккаунт.";
    case 403:
      return "Доступ запрещён.";
    case 400:
      return "Неверные данные. Проверьте поля.";
    case 500:
      return "Ошибка сервера. Попробуйте позже.";
    default:
      break;
  }

  // 3. Сеть
  if (error?.message?.includes("Network Error")) {
    return "Нет соединения с сервером.";
  }

  // 4. Axios
  if (error?.message) {
    return error.message;
  }

  return "Неизвестная ошибка";
};