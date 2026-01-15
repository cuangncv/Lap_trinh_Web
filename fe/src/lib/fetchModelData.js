/**
 * fetchModel - Fetch a model from the web server.
 *
//  * @param {string} url      The URL to issue the GET request.
 */
// async function fetchModel(url) {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       console.error(
//         "Fetch error: server responded with status",
//         response.status
//       );
//       return null;
//     }
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.error("Fetch error:", error);
//     return null;
//   }
// }

// export default fetchModel;
// src/lib/fetchModelData.js

/**
 * Gọi API và parse JSON.
 * @param {string} url – Đường dẫn endpoint (ví dụ '/api/user/list')
 * @returns {Promise<any[]|object|null>}
 *   - Với `/user/list`, luôn trả về `[]` khi lỗi hoặc chưa login.
 *   - Với các endpoint khác, trả về `null` khi lỗi.
 */
async function fetchModel(url) {
  try {
    const response = await fetch(url, {
      // gửi kèm cookie để backend nhận ra session đã đăng nhập
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Fetch error: server responded with status",
        response.status
      );

      // Nếu là lấy danh sách users, trả về mảng rỗng
      if (url.endsWith("/user/list")) {
        return [];
      }
      return null;
    }

    const result = await response.json();
    // Đảm bảo result là mảng với /user/list
    if (url.endsWith("/user/list") && !Array.isArray(result)) {
      return [];
    }
    return result;
  } catch (error) {
    console.error("Fetch error:", error);

    if (url.endsWith("/user/list")) {
      return [];
    }
    return null;
  }
}

export default fetchModel;
