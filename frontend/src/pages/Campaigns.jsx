import React, { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import styled from 'styled-components';
import CampaignCard from '../components/CampaignCard';
import SkeletonLoader from '../components/SkeletonLoader';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const { addToast } = useToast();
  const limit = 12;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit, ...filters });
    // Remove empty filters
    Object.keys(filters).forEach(k => !filters[k] && params.delete(k));
    
    fetch(`/api/campaigns?${params}`)
      .then(async response => {
        if (!response.ok) {
          const error = await response.text();
          console.error('API Error:', error);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text().then(text => {
          try {
            return text ? JSON.parse(text) : {};
          } catch (e) {
            console.error('Failed to parse JSON:', text);
            throw new Error('Invalid JSON response');
          }
        });
      })
      .then(data => {
        setCampaigns(data.items || []);
        setTotal(data.total || 0);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        addToast(error.message || 'Failed to load campaigns', 'error');
      })
      .finally(() => setLoading(false));
  }, [page, filters, addToast]);

  const totalPages = Math.ceil(total / limit);

  // Styles
  const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
  `;

  const Header = styled.div`
    margin-bottom: 24px;
  `;

  const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  `;

  const FilterContainer = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    align-items: center;
  `;

  const Select = styled.select`
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: white;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
  `;

  const CampaignsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
    
    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  `;

  const Pagination = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 32px;
  `;

  const PageButton = styled.button`
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    background: ${props => props.$active ? '#3b82f6' : 'white'};
    color: ${props => props.$active ? 'white' : '#4b5563'};
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background: ${props => props.$active ? '#2563eb' : '#f3f4f6'};
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  return (
    <Container>
      <Header>
        <Title>All Campaigns</Title>
      </Header>

      <FilterContainer>
        <Select 
          value={filters.status} 
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          aria-label="Filter by status"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select 
          value={filters.sortBy} 
          onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
          aria-label="Sort by"
        >
          <option value="createdAt">Newest</option>
          <option value="-createdAt">Oldest</option>
          <option value="currentAmount">Most Funded</option>
          <option value="-currentAmount">Least Funded</option>
        </Select>
      </FilterContainer>

      {loading ? (
        <CampaignsGrid>
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} height={400} style={{ borderRadius: 12 }} />
          ))}
        </CampaignsGrid>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <p style={{ marginBottom: 16 }}>No campaigns found.</p>
          <a 
            href="/create-campaign" 
            style={{ 
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 500,
              padding: '8px 16px',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              transition: 'all 0.2s',
              display: 'inline-block',
              '&:hover': {
                background: '#f0f7ff'
              }
            }}
          >
            Create Your First Campaign
          </a>
        </div>
      ) : (
        <CampaignsGrid>
          {campaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </CampaignsGrid>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PageButton 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
            aria-label="Previous page"
          >
            Previous
          </PageButton>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show first page, last page, and pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            return (
              <PageButton
                key={pageNum}
                onClick={() => setPage(pageNum)}
                $active={page === pageNum}
                aria-label={`Page ${pageNum}`}
                aria-current={page === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </PageButton>
            );
          })}
          
          {totalPages > 5 && page < totalPages - 2 && (
            <span style={{ display: 'flex', alignItems: 'center' }}>...</span>
          )}
          
          {totalPages > 5 && page < totalPages - 1 && (
            <PageButton
              onClick={() => setPage(totalPages)}
              $active={false}
              aria-label={`Page ${totalPages}`}
            >
              {totalPages}
            </PageButton>
          )}
          
          <PageButton 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            aria-label="Next page"
          >
            Next
          </PageButton>
        </Pagination>
      )}
    </Container>
  );
}
