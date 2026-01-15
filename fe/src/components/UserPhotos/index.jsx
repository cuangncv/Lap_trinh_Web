import { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Box,
  Divider,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import "./styles.css";

function UserPhotos({ user, reloaded }) {
  const { userId } = useParams();
  const [userDetail, setUserDetail] = useState({});
  const [photo, setPhoto] = useState([]);
  const [comments, setComments] = useState({});
  const [reload, setReload] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const connect = async () => {
      const res = await fetch(`http://localhost:8080/api/user/${userId}`);
      const data = await res.json();
      setUserDetail(data);
    };
    connect();
  }, [userId]);

  useEffect(() => {
    const connect = async () => {
      const res = await fetch(
        `http://localhost:8080/api/photosOfUser/${userId}`
      );
      const data = await res.json();
      console.log("Photos API data:", data);
      setPhoto(data);
    };
    connect();
  }, [userId, reload, reloaded]);

  const handleComment = async (photoId) => {
    const res = await fetch(
      `http://localhost:8080/api/photosOfUser/${photoId}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: comments[photoId], user_id: user._id }),
      }
    );
    if (res.ok) {
      alert("Comment successfully");
      setComments((prev) => ({ ...prev, [photoId]: "" }));
      setReload((prev) => prev + 1);
    } else {
      alert("Comment failed");
    }
  };

  const handleEditComment = async (photoId, commentId) => {
    const res = await fetch(
      `http://localhost:8080/api/photosOfUser/${photoId}/${commentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: editContent,
          user_id: user._id,
        }),
      }
    );
    if (res.ok) {
      alert("Comment updated");
      setEditingCommentId(null);
      setReload((prev) => prev + 1);
    } else {
      alert("Update failed");
    }
  };

  const handleDeleteComment = async (photoId, commentId) => {
    const res = await fetch(
      `http://localhost:8080/api/photosOfUser/${photoId}/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user._id }),
      }
    );

    if (res.ok) {
      setReload((r) => r + 1);
    } else {
      alert("Delete failed");
    }
  };

  async function handleDeletePhoto(photoId) {
    if (!window.confirm("Delete this photo?")) return;

    await fetch(`/photos/${photoId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: user._id }),
    });

    setPhoto((prev) => prev.filter((p) => p._id !== photoId));
  }

  if (!photo || photo.length === 0) {
    return (
      <Typography variant="h6">
        {userDetail.first_name} {userDetail.last_name} chưa có ảnh nào
      </Typography>
    );
  }

  return (
    <Box className="user-photos-container">
      {photo.map((photo) => (
        <Paper key={photo._id} className="photo-container">
          <img
            src={`http://localhost:8080/api/images/${photo.file_name}`}
            alt={photo.file_name}
            className="photo-image"
          />
          {user && user._id === photo.user_id && (
            <div className="delete-actions">
              <button
                className="delete-action-btn"
                onClick={() => handleDeletePhoto(photo._id)}
              >
                Delete Photo
              </button>
            </div>
          )}
          <Typography variant="body2" color="textSecondary">
            Created: {new Date(photo.date_time).toLocaleString("vi-VN")}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Comment ({(photo.comments && photo.comments.length) || 0})
          </Typography>

          {photo.comments && photo.comments.length > 0 ? (
            photo.comments.map((comment) => (
              <div key={comment._id} className="comment-container">
                <strong>
                  {comment.user.first_name} {comment.user.last_name}
                </strong>
                : {comment.comment}
                <span className="comment-time">
                  {new Date(comment.date_time).toLocaleString("vi-VN")}
                </span>
                
                {user && user._id === comment.user._id && (
                  <span className="comment-actions">
                    {editingCommentId === comment._id ? (
                      <>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <button
                          onClick={() =>
                            handleEditComment(photo._id, comment._id)
                          }
                        >
                          Save
                        </button>
                        <button onClick={() => setEditingCommentId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditContent(comment.comment);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() =>
                            handleDeleteComment(photo._id, comment._id)
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </span>
                )}

                
              </div>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No comments yet
            </Typography>
          )}

          <textarea
            placeholder="Write your comment here..."
            className="comment-area"
            value={comments[photo._id] || ""}
            onChange={(e) =>
              setComments({ ...comments, [photo._id]: e.target.value })
            }
          />
          <button className="btn-send" onClick={() => handleComment(photo._id)}>
            Send
          </button>
        </Paper>
      ))}
    </Box>
  );
}

export default UserPhotos;
