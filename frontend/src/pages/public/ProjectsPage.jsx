import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Reveal from '../../components/common/Reveal';
import { EmptyState, ErrorState, SkeletonCards } from '../../components/common/States';
import ProjectCard from '../../components/public/ProjectCard';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { projectsApi } from '../../services/endpoints';

const PAGE_SIZE = 9;

/** Portfolio listing with category filter, search and pagination. */
export default function ProjectsPage() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  const { data: categoriesData } = useApi(() => projectsApi.listCategories(), []);

  const { data, loading, error, reload } = useApi(
    () =>
      projectsApi.list({
        page,
        limit: PAGE_SIZE,
        category: activeCategory || undefined,
        search: debouncedSearch || undefined,
      }),
    [page, activeCategory, debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch]);

  const categories = categoriesData || [];
  const projects = data?.items || [];
  const meta = data?.meta;

  useDocumentMeta({
    title: `Projects | ${settings.companyName || 'Karigor Decore'}`,
    description:
      'Completed aluminum, glass and interior projects - residential, office and commercial work by Karigor Decore.',
  });

  const selectCategory = (category) => {
    if (!category) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category }, { replace: true });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="Our Projects"
        description="A selection of completed projects - from private residences to full commercial fit-outs. Every project is built by our own fabrication and installation teams."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Projects' }]}
      />

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <div className="filter-chips" role="group" aria-label="Filter by project category">
              <button
                type="button"
                className={`filter-chip${!activeCategory ? ' filter-chip--active' : ''}`}
                onClick={() => selectCategory('')}
              >
                All Projects
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-chip${
                    activeCategory === category ? ' filter-chip--active' : ''
                  }`}
                  onClick={() => selectCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-input">
              <Icon name="search" size={17} />
              <input
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search projects"
              />
            </label>
          </div>

          {loading ? (
            <SkeletonCards count={PAGE_SIZE} />
          ) : error ? (
            <ErrorState onRetry={() => reload()} />
          ) : projects.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title="No projects found"
              message={
                debouncedSearch || activeCategory
                  ? 'Try a different search term or category.'
                  : 'Project case studies will be published here soon.'
              }
            />
          ) : (
            <>
              <div className="grid grid--3">
                {projects.map((project, index) => (
                  <Reveal key={project._id} delay={(index % 3) * 80}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
              <div style={{ marginTop: 'var(--space-10)', display: 'flex', justifyContent: 'center' }}>
                <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
              </div>
            </>
          )}
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <Reveal className="cta-band">
            <h2>Have a Project in Mind?</h2>
            <p>
              Every project here started with a conversation. Share your idea and we will
              prepare a detailed plan and quotation for you.
            </p>
            <div className="cta-band__actions">
              <Button to="/quote" variant="accent" size="lg" icon="send">
                Request a Quote
              </Button>
              <Button to="/services" variant="ghost" size="lg" iconRight="arrow-right">
                Explore Our Services
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
