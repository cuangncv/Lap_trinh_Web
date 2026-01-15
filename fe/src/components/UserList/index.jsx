import React, { useEffect, useState } from "react";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";
import { Link } from "react-router-dom";

function UserList() {
  const [users, setUser] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await fetchModel(
        `http://localhost:8080/api/user/list`
      );
      setUser(data ?? []);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    users.forEach(async (user) => {
      const resPhoto = await fetch(
        `http://localhost:8080/api/user/photoCount/${user._id}`,
        { credentials: "include" }
      );
      const photoData = await resPhoto.json();

      const resCmt = await fetch(
        `http://localhost:8080/api/user/commentCount/${user._id}`,
        { credentials: "include" }
      );
      const cmtData = await resCmt.json();

      setPhotoCounts((prev) => ({
        ...prev,
        [user._id]: photoData.count,
      }));

      setCommentCounts((prev) => ({
        ...prev,
        [user._id]: cmtData.count,
      }));
    });
  }, [users]);

  const filteredUsers = users.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul>
        {filteredUsers.map((user) => (
          <li key={user._id}>
            <Link to={`/user/${user._id}`} className="user-link">
              {user.first_name} {user.last_name}
            </Link>
            <span className="photo-count">
              {photoCounts[user._id] ?? 0} photos,{" "}
              {commentCounts[user._id] ?? 0} comments
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
