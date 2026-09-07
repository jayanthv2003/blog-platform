import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PostForm from '../components/PostForm';
import postService from '../services/postService';

const CreatePost = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      const { post } = await postService.createPost(form);
      toast.success(form.status === 'draft' ? 'Draft saved' : 'Post published');
      navigate(`/post/${post.slug}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-medium text-ink dark:text-paper">Write a new post</h1>
      <PostForm submitting={submitting} submitLabel="Publish" onSubmit={handleSubmit} />
    </div>
  );
};

export default CreatePost;
