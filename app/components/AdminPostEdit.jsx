"use client"
import React, { useState, useEffect } from 'react'

const AdminPostEdit = ({ postId }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Fetch existing post data when component mounts
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/post/${postId}`);
        if (response.ok) {
          const post = await response.json();
          setFormData({
            name: post.name || '',
            url: post.url || '',
            content: post.content || ''
          });
        } else {
          setMessage('Error: Could not fetch post data');
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`/api/post/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setMessage(`Post "${updatedPost.name}" updated successfully!`);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
        <h1 className="text-4xl font-bold">Edit Post</h1>
        <div className="p-4">Loading post data...</div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
      <h1 className="text-4xl font-bold">Edit Post</h1>

      {message && (
        <div className={`p-4 rounded-md w-full max-w-md ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div>
          <label htmlFor="name">Title</label><br />
          <input 
            className="border border-gray-300 rounded-md p-2 w-full" 
            type="text" 
            id="name" 
            name="name" 
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="url">URL</label><br />
          <input 
            className="text-sm border border-gray-300 rounded-md p-2 w-full" 
            type="text" 
            id="url" 
            name="url" 
            value={formData.url}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content</label><br />  
          <textarea 
            className="border border-gray-300 rounded-md p-2 w-full h-32" 
            id="content" 
            name="content" 
            value={formData.content}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button 
          className="cursor-pointer bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed" 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Post'}
        </button>
      </form>  
    </main>
  );
}

export default AdminPostEdit