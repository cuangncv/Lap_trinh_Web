import { useState } from "react";

export default function ChangePassword() {
  const [loginName, setLoginName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8080/api/user/changepassword",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login_name: loginName,
            oldPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Đổi mật khẩu thất bại");
      } else {
        setMessage("Đổi mật khẩu thành công");
        setOldPassword("");
        setNewPassword("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2 className="form-title">Change Password</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
          <label>UserName</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <label>OldPassWord</label>
        </div>

        <div className="input-group">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <label>NewPassWord</label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Confirm
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
