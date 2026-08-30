import { useEffect, useState, useCallback } from "react";

function AdminDashboard() {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [roles, setRoles] = useState([]);

  const token = localStorage.getItem("adminToken");

  const fetchCategories = useCallback(async () => {
    const res = await fetch("http://localhost:8080/api/admin/categories", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        return;
    }

    const data = await res.json();
    setCategories(data);
  }, [token]);

  const fetchSkills = useCallback(async () => {
    const res = await fetch("http://localhost:8080/api/admin/skills", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        return;
    }

    const data = await res.json();
    setSkills(data);
  }, [token]);

  const fetchRoles = useCallback(async () => {
  const res = await fetch("http://localhost:8080/api/admin/job-roles", {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) return;

  const data = await res.json();
  setRoles(data);
  }, [token]);

  useEffect(() => {
    fetchCategories();
    fetchSkills();
    fetchRoles();
  }, [fetchCategories, fetchSkills, fetchRoles]);

  return (
    <div style={styles.container}>
      <h1 style={{ color: "white", textAlign: "center" }}>
        Admin Dashboard
      </h1>

      <div style={styles.grid}>
  <CategoryCard categories={categories} refresh={fetchCategories} />

  <SkillCard
    categories={categories}
    skills={skills}
    refresh={fetchSkills}
  />

  <JobRoleCard roles={roles} refresh={fetchRoles} />

  {/* ✅ NEW CARD */}
  <AssignSkillCard roles={roles} skills={skills} />
</div>
    </div>
  );
}

export default AdminDashboard;







/* ================= CATEGORY CARD ================= */

function CategoryCard({ categories, refresh }) {
  const [name, setName] = useState("");
  const token = localStorage.getItem("adminToken");

  const addCategory = async () => {
    if (!name) {
      alert("Enter category name");
      return;
    }

    await fetch("http://localhost:8080/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ categoryName: name })
    });

    setName("");
    refresh();
  };

  return (
    <div style={cardStyle}>
      <h3>Manage Categories</h3>

      <input
        style={inputStyle}
        placeholder="Category Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button style={buttonStyle} onClick={addCategory}>
        Add Category
      </button>

      <hr />

      <h4>All Categories</h4>

      {categories.length === 0 ? (
  <p>No categories yet</p>
) : (
  categories.map((c) => (
    <p key={c.categoryId}>• {c.categoryName}</p>
  ))
)}
    </div>
  );
}





/* ================= SKILL CARD ================= */

function SkillCard({ categories, skills, refresh }) {
  const [skillName, setSkillName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const token = localStorage.getItem("adminToken");

  const addSkill = async () => {
    if (!skillName || !categoryId) {
      alert("Fill all fields");
      return;
    }

    await fetch("http://localhost:8080/api/admin/skills", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ skillName, categoryId })
    });

    setSkillName("");
    setCategoryId("");
    refresh();
  };

  return (
    <div style={cardStyle}>
      <h3>Add Skill</h3>

      <input
        style={inputStyle}
        placeholder="Skill Name"
        value={skillName}
        onChange={(e) => setSkillName(e.target.value)}
      />

      <select
        style={inputStyle}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select Category</option>
        {categories.map((c) => (
          <option key={c.categoryId} value={c.categoryId}>
            {c.categoryName}
          </option>
        ))}
      </select>

      <button style={buttonStyle} onClick={addSkill}>
        Add Skill
      </button>

      <hr />

      <h4>All Skills</h4>

      {skills.map((s) => (
        <p key={s.skillId}>
          • {s.skillName} ({s.category.categoryName})
        </p>
      ))}
    </div>
  );
}

/* ================= JOB ROLE CARD ================= */

function JobRoleCard({ roles, refresh }) {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  const token = localStorage.getItem("adminToken");

  // 🔥 Add role
  const addRole = async () => {
    if (!roleName || !description) {
      alert("Fill all fields");
      return;
    }

    await fetch("http://localhost:8080/api/admin/job-roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ roleName, description })
    });

    setRoleName("");
    setDescription("");
    refresh();
  };

  return (
    <div style={cardStyle}>
      <h3>Add Job Role</h3>

      <input
        style={inputStyle}
        placeholder="Role Name"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button style={buttonStyle} onClick={addRole}>
        Add Role
      </button>

      <hr />

      <h4>All Roles</h4>

      {roles.length === 0 ? (
        <p>No roles yet</p>
      ) : (
        roles.map((r) => (
          <p key={r.roleId}>
            • {r.roleName} ({r.description})
          </p>
        ))
      )}
    </div>
  );
}

/* ================= ASSIGN SKILL CARD ================= */

function AssignSkillCard({ roles, skills }) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [priority, setPriority] = useState("HIGH");

  const token = localStorage.getItem("adminToken");

  const assignSkillToRole = async () => {
    if (!selectedRoleId || !selectedSkillId) {
      alert("Select role and skill");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/admin/job-role-skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roleId: selectedRoleId,
          skillId: selectedSkillId,
          priority: priority
        })
      });

      if (!res.ok) {
        const err = await res.text();
        alert(err);
        return;
      }

      alert("Skill assigned to role ✅");

    } catch (err) {
      console.error(err);
      alert("Error assigning skill");
    }
  };

  return (
    <div style={cardStyle}>
      <h3>Assign Skill to Role</h3>

      <select
        style={inputStyle}
        value={selectedRoleId}
        onChange={(e) => setSelectedRoleId(e.target.value)}
      >
        <option value="">Select Role</option>
        {roles.map((role) => (
          <option key={role.roleId} value={role.roleId}>
            {role.roleName}
          </option>
        ))}
      </select>

      <select
        style={inputStyle}
        value={selectedSkillId}
        onChange={(e) => setSelectedSkillId(e.target.value)}
      >
        <option value="">Select Skill</option>
        {skills.map((skill) => (
          <option key={skill.skillId} value={skill.skillId}>
            {skill.skillName}
          </option>
        ))}
      </select>

      <select
        style={inputStyle}
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="HIGH">HIGH</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="LOW">LOW</option>
      </select>

      <button style={buttonStyle} onClick={assignSkillToRole}>
        Assign Skill
      </button>
    </div>
  );
}




/* ================= STYLES ================= */

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    background: "linear-gradient(135deg, #ff4e8a, #5b6cff)"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  }
};

const cardStyle = {
  background: "rgba(255,255,255,0.15)",
  padding: "20px",
  borderRadius: "12px",
  color: "white",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "none"
};

const buttonStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #ff4e8a, #5b6cff)",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold"
};
