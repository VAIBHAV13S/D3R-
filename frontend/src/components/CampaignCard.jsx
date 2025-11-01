import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const ImageContainer = styled.div`
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const PlaceholderImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 200%;
  animation: shimmer 2s infinite;
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  svg {
    width: 40%;
    height: 40%;
    opacity: 0.3;
    color: #6b7280;
  }
`;

const Content = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Title = styled.h3`
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Description = styled.p`
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 16px;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  width: ${props => props.progress}%;
  border-radius: 3px;
  transition: width 0.5s ease;
`;

const Meta = styled.div`
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: auto;
`;

const CampaignCard = ({ campaign }) => {
  const progress = campaign.targetAmount > 0 
    ? Math.min(100, (campaign.currentAmount / campaign.targetAmount) * 100)
    : 0;

  const gateway = 'https://gateway.pinata.cloud/ipfs/';
  
  return (
    <Link to={`/campaigns/${campaign.id}`} style={{ textDecoration: 'none' }}>
      <Card>
        <ImageContainer>
          {campaign.imageCID ? (
            <Image 
              src={`${gateway}${campaign.imageCID}`} 
              alt={campaign.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <PlaceholderImage>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </PlaceholderImage>
        </ImageContainer>
        
        <Content>
          <Title>{campaign.title}</Title>
          <Description>{campaign.description}</Description>
          
          <ProgressContainer>
            <ProgressBar progress={progress} />
          </ProgressContainer>
          
          <Meta>
            <span>{progress.toFixed(1)}% Funded</span>
            <span>{campaign.status || 'Active'}</span>
          </Meta>
        </Content>
      </Card>
    </Link>
  );
};

export default CampaignCard;
