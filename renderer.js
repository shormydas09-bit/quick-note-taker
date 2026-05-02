window.addEventListener('DOMContentLoaded', async () => {

  const notesList = document.getElementById('notesList');
  const title = document.getElementById('title');
  const content = document.getElementById('content');
  const saveBtn = document.getElementById('save');
  const deleteBtn = document.getElementById('delete');
  const addBtn = document.getElementById('addNote');

  let currentNote = null;

  async function loadNotes() {
    const notes = await window.api.getNotes();
    notesList.innerHTML = '';

    notes.forEach(n => {
      const div = document.createElement('div');
      div.innerText = n.title || 'Untitled';
      div.className = 'note-item';

      div.onclick = () => {
        currentNote = n;
        title.value = n.title;
        content.value = n.content;
      };

      notesList.appendChild(div);
    });
  }

  addBtn.onclick = () => {
    currentNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    title.value = '';
    content.value = '';
  };

  saveBtn.onclick = async () => {
    if (!currentNote) return;

    currentNote.title = title.value;
    currentNote.content = content.value;
    currentNote.updatedAt = new Date().toISOString();

    await window.api.saveNote(currentNote);
    loadNotes();
  };

  deleteBtn.onclick = async () => {
    if (!currentNote) return;

    await window.api.deleteNote(currentNote.id);
    title.value = '';
    content.value = '';
    currentNote = null;

    loadNotes();
  };

  // MENU actions
  window.api.onMenuAction('menu-new', () => addBtn.click());
  window.api.onMenuAction('menu-save', () => saveBtn.click());

  loadNotes();
});