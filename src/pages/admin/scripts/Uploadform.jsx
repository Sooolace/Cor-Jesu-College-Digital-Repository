import { useState, useEffect } from 'react';

export const Uploadform = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState(['']); // Starts with one author input
  const [abstract, setAbstract] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [pubDate, setPubDate] = useState('');
  const [file, setFile] = useState(null);
  const [studyUrls, setStudyUrls] = useState(['']); // Starts with one URL input
  const [keywords, setKeywords] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSubmissionDate(today);
  }, []);

  const handleAuthorChange = (index, event) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index] = event.target.value;
    setAuthors(updatedAuthors);
  };

  const addAuthor = () => {
    setAuthors([...authors, '']);
  };

  const removeAuthor = (index) => {
    const updatedAuthors = [...authors];
    updatedAuthors.splice(index, 1);
    setAuthors(updatedAuthors);
  };

  const handleUrlChange = (index, event) => {
    const updatedUrls = [...studyUrls];
    updatedUrls[index] = event.target.value;
    setStudyUrls(updatedUrls);
  };

  const addUrl = () => {
    setStudyUrls([...studyUrls, '']);
  };

  const removeUrl = (index) => {
    const updatedUrls = [...studyUrls];
    updatedUrls.splice(index, 1);
    setStudyUrls(updatedUrls);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic (e.g., send data to server)
    console.log({
      title,
      authors,
      abstract,
      submissionDate,
      pubDate,
      file,
      studyUrls,
      keywords,
    });
  };

  return {
    title,
    setTitle,
    authors,
    setAuthors,
    handleAuthorChange,
    addAuthor,
    removeAuthor,
    abstract,
    setAbstract,
    submissionDate,
    pubDate,
    setPubDate,
    file,
    setFile,
    studyUrls,
    handleUrlChange,
    addUrl,
    removeUrl,
    keywords,
    setKeywords,
    handleSubmit
  };
};
