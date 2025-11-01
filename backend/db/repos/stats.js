const { query } = require('../client');

async function getStats() {
  try {
    // Get total donations across all campaigns
    const donationsResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total_donations 
       FROM donations 
       WHERE status = 'completed'`
    );
    
    // Get total number of active campaigns
    const campaignsResult = await query(
      `SELECT COUNT(*) as campaign_count 
       FROM campaigns 
       WHERE status = 'active'`
    );
    
    // Since we don't have a people_helped column, we'll use a placeholder value
    // based on the number of completed campaigns
    const completedCampaignsResult = await query(
      `SELECT COUNT(*) as completed_count 
       FROM campaigns 
       WHERE status = 'completed'`
    );
    
    // Estimate people helped as 100 per completed campaign (this is a placeholder)
    const completedCampaigns = parseInt(completedCampaignsResult.rows[0]?.completed_count || 0, 10);
    
    return {
      totalDonations: parseFloat(donationsResult.rows[0]?.total_donations || 0),
      campaignCount: parseInt(campaignsResult.rows[0]?.campaign_count || 0, 10),
      peopleHelped: completedCampaigns * 100 // Placeholder: 100 people helped per completed campaign
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

module.exports = {
  getStats
};
