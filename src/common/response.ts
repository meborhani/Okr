export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: { field?: string; message: string }[] | null;
}

export function successResponse<T>(data: T, message = 'عملیات با موفقیت انجام شد'): ApiResponse<T> {
  return { success: true, message, data, errors: null };
}

export function errorResponse(
  message = 'خطایی رخ داده است',
  errors: { field?: string; message: string }[] | null = null,
): ApiResponse<null> {
  return { success: false, message, data: null, errors };
}
