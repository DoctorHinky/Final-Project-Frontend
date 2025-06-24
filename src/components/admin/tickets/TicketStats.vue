<!-- src/components/admin/tickets/TicketStats.vue -->
<template>
  <div class="ticket-stats">
    <div class="stats-grid">
      <!-- Alle Tickets -->
      <div class="stat-card total-card" @click="emitFilterByStatus('')">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 5v2"></path>
            <path d="M15 11v2"></path>
            <path d="M15 17v2"></path>
            <path
              d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"
            ></path>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.total || 0 }}</div>
          <div class="stat-label">Alle Tickets</div>
        </div>
      </div>

      <!-- Offene Tickets -->
      <div class="stat-card open-card" @click="emitFilterByStatus(TicketStatus.OPEN)">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.byStatus?.open || 0 }}</div>
          <div class="stat-label">Offen</div>
        </div>
      </div>

      <!-- In Bearbeitung -->
      <div class="stat-card in-progress-card" @click="emitFilterByStatus(TicketStatus.IN_PROGRESS)">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.byStatus?.in_progress || 0 }}</div>
          <div class="stat-label">In Bearbeitung</div>
        </div>
      </div>
      <!-- diese stats gibts im bakcend nicht -->
      <!-- Wartend -->
      <!--  <div class="stat-card waiting-card" @click="emitFilterByStatus(TicketStatus.WAITING)">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.byStatus?.waiting || 0 }}</div>
          <div class="stat-label">Wartend</div>
        </div>
      </div> -->

      <!-- Gelöst -->
      <!-- <div class="stat-card resolved-card" @click="emitFilterByStatus(TicketStatus.RESOLVED)">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.byStatus?.resolved || 0 }}</div>
          <div class="stat-label">Gelöst</div>
        </div>
      </div> -->

      <!-- Geschlossen -->
      <div class="stat-card closed-card" @click="emitFilterByStatus(TicketStatus.CLOSED)">
        <div class="stat-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.byStatus?.closed || 0 }}</div>
          <div class="stat-label">Geschlossen</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TicketStatus } from "@/types";

export default defineComponent({
  name: "TicketStats",
  props: {
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        byStatus: {},
        byPriority: {},
        byCategory: {},
      }),
    },
  },
  emits: ["filter-by-status"],
  setup(_props, { emit }) {
    // Enum für den Template-Zugriff
    const TicketStatusEnum = TicketStatus;

    // Status-Filter Event auslösen
    const emitFilterByStatus = (status: string) => {
      emit("filter-by-status", status);
    };

    return {
      TicketStatus,
      TicketStatusEnum,
      emitFilterByStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.ticket-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &.total-card {
    border-left-color: #6b7280;

    .stat-icon {
      background-color: rgba(107, 114, 128, 0.15);
      color: #9ca3af;
    }
  }

  &.open-card {
    border-left-color: #3b82f6;

    .stat-icon {
      background-color: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
  }

  &.in-progress-card {
    border-left-color: #ec4899;

    .stat-icon {
      background-color: rgba(236, 72, 153, 0.15);
      color: #ec4899;
    }
  }

  &.waiting-card {
    border-left-color: #fb923c;

    .stat-icon {
      background-color: rgba(251, 146, 60, 0.15);
      color: #fb923c;
    }
  }

  &.resolved-card {
    border-left-color: #22c55e;

    .stat-icon {
      background-color: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }
  }

  &.closed-card {
    border-left-color: #64748b;

    .stat-icon {
      background-color: rgba(100, 116, 139, 0.15);
      color: #64748b;
    }
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-info {
  flex: 1;

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #f0f0f0;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #bbb;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>