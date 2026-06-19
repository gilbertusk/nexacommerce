export function successResponse(data: any, message = 'Success', statusCode = 200) {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message: string, statusCode = 500, errors: any = null) {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}
