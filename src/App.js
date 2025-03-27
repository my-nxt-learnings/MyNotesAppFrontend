import React, { useState, useEffect } from "react";
import "./App.css"; 

const API_URL = "https://mynotesappbackend.onrender.com"; 

function App() {
  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");


  // Fetch notes when the component loads
  useEffect(() => {
    fetchNotes();
  }, []);

  // Function to fetch notes from the backend with retry logic
  const fetchNotes = async (retryCount = 3) => {
    try {
      const response = await fetch(`${API_URL}/api/notes`);
      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      if (retryCount > 0) {
        setTimeout(() => fetchNotes(retryCount - 1), 2000); // Retry after 2s
      }
    }
  };

  // Function to add a new note
  const handleAddNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Title and content cannot be empty!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to add note");
      }

      await fetchNotes(); // Refresh notes
      setNewTitle("");
      setNewContent("");
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Function to delete a note
  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes(notes.filter((note) => note.id !== id)); // Update state instantly
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Function to enable edit mode
  const handleEditClick = (note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  // Function to update the note
  const handleUpdateNote = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert("Title and content cannot be empty!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      await fetchNotes(); // Refresh notes
      setEditingId(null); // Reset edit mode only if successful
      setEditTitle("");
      setEditContent("");
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  return (
    <div className="container">
      <h1 className="heading">📝 Notes App</h1>

      {/* Input fields for adding a new note */}
      <div className="input-container">
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="input"
        />
        <textarea
          placeholder="Content"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="textarea"
        />
        <button onClick={handleAddNote} className="add-button">
          ➕ Add Note
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search notes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input search"
      />


      {/* Notes list */}
      <ul className="notes-list">
        {filteredNotes.map((note) => (
          <li key={note.id} className="note-card">
            {editingId === note.id ? (
              // Editing Mode
              <div>
                <div className="input-textaraea">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="textarea"
                />
                </div>
                <div className="save-cancel">
                <button onClick={handleUpdateNote} className="update-button">
                  ✅ Save
                </button>
                <button onClick={() => setEditingId(null)} className="cancel-button">
                  ❌ Cancel
                </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <h3 className="note-title">{note.title}</h3>
                <p className="note-content">{note.content}</p>
                <button onClick={() => handleEditClick(note)} className="edit-button">
                  ✏️ Edit
                </button>
                <button onClick={() => handleDeleteNote(note.id)} className="delete-button">
                  ❌ Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
