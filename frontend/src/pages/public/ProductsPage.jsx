import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import Reveal from '../../components/common/Reveal';
import { EmptyState, ErrorState, SkeletonCards } from '../../components/common/States';
import ProductCard from '../../components/public/ProductCard';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { categoriesApi, productsApi } from '../../services/endpoints';

const PAGE_SIZE = 9;

/**
 * Product catalog with server-side search, category filter and pagination.
 * The selected category is kept in the URL (?category=slug) so the view
 * can be linked and shared.
 */
export default function ProductsPage() {
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  const { data: categoriesData } = useApi(
    () => categoriesApi.list({ scope: 'product', limit: 100 }),
    []
  );

  const { data, loading, error, reload } = useApi(
    () =>
      productsApi.list({
        page,
        limit: PAGE_SIZE,
        category: activeCategory || undefined,
        search: debouncedSearch || undefined,
      }),
    [page, activeCategory, debouncedSearch]
  );

  // Back to page 1 whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [activeCategory, debouncedSearch]);

  const categories = categoriesData?.items || [];
  const products = data?.items || [];
  const meta = data?.meta;

  useDocumentMeta({
    title: `Products | ${settings.companyName || 'Karigor Decore'}`,
    description:
      settings.defaultMeta?.description ||
      'Browse aluminum windows, doors, glass, partitions and decoration products.',
  });

  const selectCategory = (slug) => {
    if (!slug) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ category: slug }, { replace: true });
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Our Products"
        description="Quality windows, doors, glass and aluminum products - manufactured in our own workshop and installed by our own team."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
      />

      <section className="section">
        <div className="container">
          <div className="filters-bar">
            <div className="filter-chips" role="group" aria-label="Filter by category">
              <button
                type="button"
                className={`filter-chip${!activeCategory ? ' filter-chip--active' : ''}`}
                onClick={() => selectCategory('')}
              >
                All Products
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  className={`filter-chip${
                    activeCategory === category.slug ? ' filter-chip--active' : ''
                  }`}
                  onClick={() => selectCategory(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <label className="search-input">
              <Icon name="search" size={17} />
              <input
                type="search"
                placeholder="Search products…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />
            </label>
          </div>

          {loading ? (
            <SkeletonCards count={PAGE_SIZE} />
          ) : error ? (
            <ErrorState onRetry={() => reload()} />
          ) : products.length === 0 ? (
            <EmptyState
              icon="package"
              title="No products found"
              message={
                debouncedSearch || activeCategory
                  ? 'Try a different search term or category.'
                  : 'Products will appear here once they are added in the dashboard.'
              }
            />
          ) : (
            <>
              <div className="grid grid--3">
                {products.map((product, index) => (
                  <Reveal key={product._id} delay={(index % 3) * 80}>
                    <ProductCard product={product} />
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
    </>
  );
}
