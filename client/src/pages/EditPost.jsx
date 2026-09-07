import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PostForm from '../components/PostForm';
import postService from '../services/postService';
import Loader from '../components/Loader';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValue, setInitialValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    postService
      .getPost(id)
      .then(({ post }) => {
        setInitialValue({
          title: post.title,
          subtitle: post.subtitle,
          category: post.category?._id,
          tags: post.tags?.join(', '),
          content: post.content,
          status: post.status,
          coverImage: post.coverImage,
        });
      })
      .catch(() => toast.error('Could not load post'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    try {
      const { post } = await postService.updatePost(id, form);
      toast.success('Post updated');
      navigate(`/post/${post.slug}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullscreen label="Loading post" />;
  if (!initialValue) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-medium text-ink dark:text-paper">Edit post</h1>
      <PostForm
        initialValue={initialValue}
        submitting={submitting}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditPost;
