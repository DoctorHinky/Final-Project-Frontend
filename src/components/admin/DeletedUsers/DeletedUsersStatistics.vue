<!-- src/components/admin/users/DeletedUsersStatistics.vue -->
<template>
  <div class="deleted-users-statistics-container">
    <div class="stats-header">
      <h2>Löschstatistiken</h2>
      <p>Übersicht über gelöschte Benutzerkonten</p>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalDeleted }}</h3>
          <p>Gesamt gelöscht</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.last30Days }}</h3>
          <p>Letzte 30 Tage</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.restoredCount }}</h3>
          <p>Wiederhergestellt</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.permanentlyDeleted }}</h3>
          <p>Endgültig gelöscht</p>
        </div>
      </div>
    </div>

    <div class="stats-charts">
      <div class="chart-section">
        <h3>Löschgründe Verteilung</h3>
        <div class="chart-container">
          <div class="pie-chart">
            <div v-for="(item, index) in reasonDistribution" :key="index" 
                 class="pie-segment" 
                 :style="getSegmentStyle(item, index)">
              <span class="segment-label">{{ item.percentage }}%</span>
            </div>
          </div>
          <div class="chart-legend">
            <div v-for="(item, index) in reasonDistribution" :key="index" class="legend-item">
              <span class="legend-color" :style="{ backgroundColor: getColor(index) }"></span>
              <span class="legend-label">{{ item.label }}</span>
              <span class="legend-value">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <h3>Löschungen pro Monat</h3>
        <div class="chart-container">
          <div class="bar-chart">
            <div class="chart-bars">
              <div v-for="month in monthlyStats" :key="month.month" class="bar-wrapper">
                <div class="bar" :style="{ height: getBarHeight(month.count) }">
                  <span class="bar-value">{{ month.count }}</span>
                </div>
                <span class="bar-label">{{ month.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-details">
      <div class="detail-section">
        <h3>Top-Administratoren nach Löschungen</h3>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Anzahl Löschungen</th>
              <th>Prozent</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in topAdmins" :key="admin.name">
              <td>{{ admin.name }}</td>
              <td>{{ admin.count }}</td>
              <td>
                <div class="percentage-bar">
                  <div class="percentage-fill" :style="{ width: admin.percentage + '%' }"></div>
                  <span class="percentage-text">{{ admin.percentage }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="detail-section">
        <h3>Löschaktivität nach Zeit</h3>
        <div class="time-heatmap">
          <div class="heatmap-row" v-for="(row, day) in activityHeatmap" :key="day">
            <span class="day-label">{{ getDayLabel(day) }}</span>
            <div class="hour-cells">
              <div v-for="(value, hour) in row" :key="hour" 
                   class="hour-cell" 
                   :class="getHeatmapClass(value)"
                   :title="`${getDayLabel(day)} ${hour}:00 - ${value} Löschungen`">
              </div>
            </div>
          </div>
          <div class="heatmap-legend">
            <span>Weniger</span>
            <div class="legend-cells">
              <div class="hour-cell level-0"></div>
              <div class="hour-cell level-1"></div>
              <div class="hour-cell level-2"></div>
              <div class="hour-cell level-3"></div>
              <div class="hour-cell level-4"></div>
            </div>
            <span>Mehr</span>
          </div>
        </div>
      </div>
    </div>

    <div class="export-section">
      <button class="btn-export" @click="exportStatistics">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Statistiken exportieren
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';

interface Statistics {
  totalDeleted: number;
  last30Days: number;
  restoredCount: number;
  permanentlyDeleted: number;
}

interface ReasonDistribution {
  reason: string;
  label: string;
  count: number;
  percentage: number;
}

interface MonthlyStats {
  month: string;
  label: string;
  count: number;
}

interface AdminStats {
  name: string;
  count: number;
  percentage: number;
}

export default defineComponent({
  name: 'DeletedUsersStatistics',
  setup() {
    const stats = ref<Statistics>({
      totalDeleted: 127,
      last30Days: 23,
      restoredCount: 15,
      permanentlyDeleted: 112
    });

    const reasonDistribution = ref<ReasonDistribution[]>([
      { reason: 'VIOLATION', label: 'Regelverstoß', count: 45, percentage: 35 },
      { reason: 'SELF_DELETION', label: 'Eigene Löschung', count: 32, percentage: 25 },
      { reason: 'ADMIN_DELETION', label: 'Admin-Löschung', count: 26, percentage: 20 },
      { reason: 'INACTIVITY', label: 'Inaktivität', count: 19, percentage: 15 },
      { reason: 'OTHER', label: 'Sonstige', count: 5, percentage: 5 }
    ]);

    const monthlyStats = ref<MonthlyStats[]>([
      { month: '2024-01', label: 'Jan', count: 12 },
      { month: '2024-02', label: 'Feb', count: 18 },
      { month: '2024-03', label: 'Mär', count: 15 },
      { month: '2024-04', label: 'Apr', count: 23 },
      { month: '2024-05', label: 'Mai', count: 20 },
      { month: '2024-06', label: 'Jun', count: 17 }
    ]);

    const topAdmins = ref<AdminStats[]>([
      { name: 'Admin Schmidt', count: 42, percentage: 33 },
      { name: 'Admin Weber', count: 35, percentage: 28 },
      { name: 'Admin Meyer', count: 28, percentage: 22 },
      { name: 'System', count: 22, percentage: 17 }
    ]);

    // Aktivitäts-Heatmap (Tag x Stunde)
    const activityHeatmap = ref({
      0: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      1: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      2: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      3: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      4: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      5: Array(24).fill(0).map(() => Math.floor(Math.random() * 5)),
      6: Array(24).fill(0).map(() => Math.floor(Math.random() * 5))
    });

    const colors = [
      '#e74c3c', // Rot
      '#3498db', // Blau
      '#ff9800', // Orange
      '#95a5a6', // Grau
      '#9b59b6'  // Lila
    ];

    const getColor = (index: number) => colors[index % colors.length];

    const getSegmentStyle = (item: ReasonDistribution, index: number) => {
      const startAngle = reasonDistribution.value
        .slice(0, index)
        .reduce((sum, i) => sum + i.percentage, 0) * 3.6;
      const endAngle = startAngle + item.percentage * 3.6;
      
      return {
        background: `conic-gradient(${getColor(index)} ${startAngle}deg, ${getColor(index)} ${endAngle}deg, transparent ${endAngle}deg)`,
        transform: `rotate(${startAngle}deg)`
      };
    };

    const getBarHeight = (count: number) => {
      const maxCount = Math.max(...monthlyStats.value.map(m => m.count));
      return `${(count / maxCount) * 100}%`;
    };

    const getDayLabel = (day: string | number) => {
      const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      return days[Number(day)];
    };

    const getHeatmapClass = (value: number) => {
      if (value === 0) return 'level-0';
      if (value <= 1) return 'level-1';
      if (value <= 2) return 'level-2';
      if (value <= 3) return 'level-3';
      return 'level-4';
    };

    const exportStatistics = () => {
      // TODO: Export-Funktionalität implementieren
      alert('Statistik-Export wird implementiert...');
    };

    onMounted(() => {
      // Hier könnten die echten Statistiken geladen werden
      console.log('Statistiken geladen');
    });

    return {
      stats,
      reasonDistribution,
      monthlyStats,
      topAdmins,
      activityHeatmap,
      getColor,
      getSegmentStyle,
      getBarHeight,
      getDayLabel,
      getHeatmapClass,
      exportStatistics
    };
  }
});
</script>

<style lang="scss" scoped>
.deleted-users-statistics-container {
  background-color: #222;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #333;
}

.stats-header {
  margin-bottom: 8px;
  
  h2 {
    font-size: 1.5rem;
    margin: 0 0 8px 0;
    color: #f0f0f0;
  }
  
  p {
    margin: 0;
    color: #a0a0a0;
    font-size: 0.9rem;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  
  .stat-card {
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .stat-icon {
      width: 48px;
      height: 48px;
      background-color: rgba(255, 152, 0, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ff9800;
    }
    
    .stat-content {
      h3 {
        margin: 0;
        font-size: 1.8rem;
        color: #f0f0f0;
      }
      
      p {
        margin: 0;
        color: #a0a0a0;
        font-size: 0.9rem;
      }
    }
  }
}

.stats-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  
  .chart-section {
    background-color: #1c1c1c;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    
    h3 {
      margin: 0 0 16px 0;
      color: #f0f0f0;
      font-size: 1.1rem;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }
    
    .chart-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .pie-chart {
        width: 200px;
        height: 200px;
        position: relative;
        margin: 0 auto;
        border-radius: 50%;
        background: conic-gradient(
          #e74c3c 0deg 126deg,
          #3498db 126deg 216deg,
          #ff9800 216deg 288deg,
          #95a5a6 288deg 342deg,
          #9b59b6 342deg 360deg
        );
        
        .pie-segment {
          position: absolute;
          width: 100%;
          height: 100%;
          
          .segment-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 0.8rem;
          }
        }
      }
      
      .chart-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 4px;
          }
          
          .legend-label {
            flex: 1;
            color: #d0d0d0;
            font-size: 0.9rem;
          }
          
          .legend-value {
            color: #a0a0a0;
            font-size: 0.9rem;
          }
        }
      }
      
      .bar-chart {
        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          gap: 12px;
          padding: 0 10px;
          
          .bar-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            
            .bar {
              width: 100%;
              background-color: rgba(255, 152, 0, 0.7);
              border-radius: 4px 4px 0 0;
              position: relative;
              min-height: 20px;
              transition: all 0.3s ease;
              
              &:hover {
                background-color: rgba(255, 152, 0, 0.9);
              }
              
              .bar-value {
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                color: #f0f0f0;
                font-size: 0.8rem;
                font-weight: 500;
              }
            }
            
            .bar-label {
              color: #a0a0a0;
              font-size: 0.85rem;
            }
          }
        }
      }
    }
  }
}

.stats-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  
  .detail-section {
    background-color: #1c1c1c;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 20px;
    
    h3 {
      margin: 0 0 16px 0;
      color: #f0f0f0;
      font-size: 1.1rem;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    }
    
    .admin-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #333;
      }
      
      th {
        color: #a0a0a0;
        font-weight: 500;
        font-size: 0.9rem;
      }
      
      td {
        color: #f0f0f0;
        
        .percentage-bar {
          position: relative;
          background-color: #2a2a2a;
          height: 24px;
          border-radius: 4px;
          overflow: hidden;
          
          .percentage-fill {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background-color: rgba(255, 152, 0, 0.5);
            transition: width 0.3s ease;
          }
          
          .percentage-text {
            position: absolute;
            top: 50%;
            left: 8px;
            transform: translateY(-50%);
            font-size: 0.85rem;
            font-weight: 500;
          }
        }
      }
    }
    
    .time-heatmap {
      .heatmap-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 4px;
        
        .day-label {
          width: 30px;
          color: #a0a0a0;
          font-size: 0.85rem;
        }
        
        .hour-cells {
          display: flex;
          gap: 2px;
          flex: 1;
        }
      }
      
      .hour-cell {
        width: 100%;
        height: 20px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          outline: 1px solid #666;
        }
        
        &.level-0 {
          background-color: #2a2a2a;
        }
        
        &.level-1 {
          background-color: rgba(255, 152, 0, 0.2);
        }
        
        &.level-2 {
          background-color: rgba(255, 152, 0, 0.4);
        }
        
        &.level-3 {
          background-color: rgba(255, 152, 0, 0.6);
        }
        
        &.level-4 {
          background-color: rgba(255, 152, 0, 0.8);
        }
      }
      
      .heatmap-legend {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 16px;
        justify-content: center;
        
        span {
          color: #a0a0a0;
          font-size: 0.85rem;
        }
        
        .legend-cells {
          display: flex;
          gap: 2px;
          
          .hour-cell {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }
}

.export-section {
  display: flex;
  justify-content: center;
  
  .btn-export {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background-color: #333;
    border: none;
    border-radius: 4px;
    color: #f0f0f0;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #444;
    }
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .stats-charts,
  .stats-details {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    .bar-chart .chart-bars {
      gap: 6px;
      
      .bar-wrapper .bar-label {
        font-size: 0.7rem;
      }
    }
  }
}
</style>