import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { formatDate } from '../utils/format';

const HeroBanner = ({ featuredPost }) => {
  return (
    <section className="border-b border-line dark:border-line-dark">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="font-display text-[2.75rem] font-medium leading-[1.08] tracking-tight text-ink sm:text-6xl dark:text-paper">
            Stories worth
            <br />
            staying up for.
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-slate">
            Inkline is a home for independent writing — essays, guides, and ideas from
            people who care about the sentence as much as the subject.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/explore"
              className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-ink-light dark:bg-accent dark:text-ink dark:hover:bg-accent-dark"
            >
              Start reading
            </Link>
            <Link
              to="/write"
              className="link-underline inline-flex items-center gap-1 text-sm font-medium text-ink dark:text-paper"
            >
              Start writing <FiArrowUpRight size={15} />
            </Link>
          </div>
        </motion.div>

        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <Link to={`/post/${featuredPost.slug}`} className="group block">
              <div className="overflow-hidden rounded-xl bg-ink/5 dark:bg-paper/5">
                {featuredPost.coverImage?.url ? (
                  <img
                    src={featuredPost.coverImage.url}
                    alt={featuredPost.title}
                    className="aspect-[16/11] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex aspect-[16/11] w-full items-center justify-center">
                    <span className="font-display text-5xl text-ink/15 dark:text-paper/15">In</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-accent">Featured</p>
              <h2 className="mt-1.5 font-display text-2xl font-medium leading-snug text-ink group-hover:text-accent dark:text-paper">
                {featuredPost.title}
              </h2>
              <p className="mt-2 text-sm text-slate">
                {featuredPost.author?.name} · {formatDate(featuredPost.createdAt)}
              </p>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
