<!-- src/pages/admin/Tickets.vue -->
<template>
  <AdminLayout page-title="Ticket Management" active-menu="tickets">
    <div class="ticket-management-placeholder">
      <h1>Ticket Management System</h1>
      <p>Das Ticket Management System wird gerade eingerichtet. Bald können Sie hier alle Benutzeranfragen verwalten!</p>
      
      <div class="placeholder-info">
        <h2>Geplante Funktionen:</h2>
        <ul>
          <li>Übersicht aller Tickets</li>
          <li>Detailansicht von Tickets</li>
          <li>Ticket-Status Verwaltung</li>
          <li>Kommunikation mit Nutzern</li>
          <li>Ticket-Statistiken</li>
        </ul>
      </div>
    </div>
  </AdminLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';

export default defineComponent({
  name: 'AdminTickets',
  components: {
    AdminLayout
  }
});
</script>

<style lang="scss" scoped>
.ticket-management-placeholder {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-top: 24px;
  
  h1 {
    font-size: 1.8rem;
    margin-bottom: 16px;
    color: #ff9800;
  }
  
  p {
    font-size: 1.1rem;
    color: #ccc;
    margin-bottom: 24px;
  }
  
  .placeholder-info {
    text-align: left;
    max-width: 500px;
    margin: 0 auto;
    background-color: #333;
    padding: 20px;
    border-radius: 6px;
    
    h2 {
      font-size: 1.2rem;
      margin-bottom: 12px;
      color: #f0f0f0;
    }
    
    ul {
      padding-left: 20px;
      
      li {
        margin-bottom: 8px;
        color: #bbb;
      }
    }
  }
}
</style>