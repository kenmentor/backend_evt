export interface ApiResponse {
  data: unknown;
  error: Record<string, unknown>;
  status: number;
  message: string;
  ok: boolean;
}

export const goodResponse = (data: unknown = [], message = "success", status: number = 200): ApiResponse => {
    const safeStatus = typeof status === "number" && status > 0 && status < 600 ? status : 200;
    return {
        data: data ?? [],
        error: {},
        status: safeStatus,
        message: String(message || "success"),
        ok: true
    };
};

export const badResponse = (message = "Something went wrong", status: number = 500, error: unknown = {}): ApiResponse => {
    const safeStatus = typeof status === "number" && status > 0 && status < 600 ? status : 500;
    let errorObj: Record<string, unknown> = {};
    try {
        if (error && typeof error === "object") {
            errorObj = { message: String((error as Record<string, unknown>).message || ""), ...(error as Record<string, unknown>) };
        }
    } catch (e) {
        errorObj = { message: "Unknown error" };
    }
    return {
        data: [],
        error: errorObj,
        status: safeStatus,
        message: String(message || "Something went wrong"),
        ok: false
    };
};
