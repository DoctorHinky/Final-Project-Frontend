<!-- src/components/member/dashboard/Friends.vue -->
<template>
  <div class="friends-dashboard">
    <div class="page-header">
      <h2>Meine Freunde</h2>
      <p>Verbinde dich mit anderen Eltern und tausche dich über Erfahrungen aus</p>
    </div>
    
    <!-- Freunde-Statistik-Karten -->
    <div class="friends-stats">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(74, 210, 149, 0.2)">👥</div>
        <div class="stat-info">
          <h3>{{ friendsCount }}</h3>
          <p>Freunde</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(53, 204, 208, 0.2)">📨</div>
        <div class="stat-info">
          <h3>{{ pendingRequestsCount }}</h3>
          <p>Offene Anfragen</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background-color: rgba(155, 225, 93, 0.2)">💬</div>
        <div class="stat-info">
          <h3>{{ suggestionsCount }}</h3>
          <p>Empfehlungen</p>
        </div>
      </div>
    </div>
    
    <!-- Tabs für Freunde, Anfragen und Empfehlungen -->
    <div class="friends-tabs">
      <button 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-button"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <!-- Suchleiste -->
    <div class="search-section" v-if="activeTab === 'friends'">
      <div class="search-container">
        <input 
          type="text" 
          placeholder="Freunde suchen..." 
          v-model="searchQuery"
          @input="filterFriends"
        />
        <button class="search-button">
          <span class="search-icon">🔍</span>
        </button>
      </div>
    </div>
    
    <!-- Freunde-Liste -->
    <div v-if="activeTab === 'friends'" class="friends-list">
      <div v-if="filteredFriends.length > 0" class="friends-grid">
        <div 
          v-for="friend in filteredFriends" 
          :key="friend.id" 
          class="friend-card"
        >
          <div class="friend-avatar">
            <span class="avatar-placeholder">{{ getInitials(friend.name) }}</span>
            <span v-if="friend.isOnline" class="online-indicator"></span>
          </div>
          <div class="friend-info">
            <h3>{{ friend.name }}</h3>
            <p class="friend-bio">{{ friend.bio }}</p>
            <div class="friend-meta">
              <span class="friend-since">Freunde seit {{ friend.friendSince }}</span>
              <span class="shared-interests">{{ friend.sharedInterests }} gemeinsame Interessen</span>
            </div>
          </div>
          <div class="friend-actions">
            <button class="action-button message">Nachricht</button>
            <button class="action-button more" @click="toggleFriendMenu(friend.id)">⋮</button>
            <div v-if="activeFriendMenu === friend.id" class="friend-menu">
              <button @click="unfriend(friend.id)">Freundschaft beenden</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Leerer Zustand für Freunde -->
      <div v-else class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>Keine Freunde gefunden</h3>
        <p v-if="searchQuery">Deine Suche ergab keine Treffer. Versuche es mit einem anderen Suchbegriff.</p>
        <p v-else>Du hast noch keine Freunde hinzugefügt. Entdecke Empfehlungen oder lade Freunde ein.</p>
        <button v-if="searchQuery" @click="clearSearch" class="reset-button">Suche zurücksetzen</button>
        <button v-else @click="activeTab = 'suggestions'" class="reset-button">Empfehlungen anzeigen</button>
      </div>
    </div>
    
    <!-- Anfragen-Liste -->
    <div v-if="activeTab === 'requests'" class="requests-list">
      <div v-if="pendingRequests.length > 0" class="requests-grid">
        <div 
          v-for="request in pendingRequests" 
          :key="request.id" 
          class="request-card"
        >
          <div class="request-avatar">
            <span class="avatar-placeholder">{{ getInitials(request.name) }}</span>
          </div>
          <div class="request-info">
            <h3>{{ request.name }}</h3>
            <p class="request-message">{{ request.message || 'Möchte mit dir befreundet sein.' }}</p>
            <div class="request-meta">
              <span class="request-date">Angefragt am {{ request.requestDate }}</span>
              <span class="mutual-friends">{{ request.mutualFriends }} gemeinsame Freunde</span>
            </div>
          </div>
          <div class="request-actions">
            <button class="action-button accept" @click="acceptRequest(request.id)">Annehmen</button>
            <button class="action-button decline" @click="declineRequest(request.id)">Ablehnen</button>
          </div>
        </div>
      </div>
      
      <!-- Leerer Zustand für Anfragen -->
      <div v-else class="empty-state">
        <div class="empty-icon">📨</div>
        <h3>Keine Anfragen vorhanden</h3>
        <p>Du hast derzeit keine offenen Freundschaftsanfragen.</p>
        <button @click="activeTab = 'suggestions'" class="reset-button">Empfehlungen anzeigen</button>
      </div>
    </div>
    
    <!-- Empfehlungen-Liste -->
    <div v-if="activeTab === 'suggestions'" class="suggestions-list">
      <div v-if="friendSuggestions.length > 0" class="suggestions-grid">
        <div 
          v-for="suggestion in friendSuggestions" 
          :key="suggestion.id" 
          class="suggestion-card"
        >
          <div class="suggestion-avatar">
            <span class="avatar-placeholder">{{ getInitials(suggestion.name) }}</span>
          </div>
          <div class="suggestion-info">
            <h3>{{ suggestion.name }}</h3>
            <p class="suggestion-bio">{{ suggestion.bio }}</p>
            <div class="suggestion-meta">
              <span v-if="suggestion.mutualFriends" class="mutual-friends">
                {{ suggestion.mutualFriends }} gemeinsame Freunde
              </span>
              <span v-if="suggestion.matchReason" class="match-reason">
                {{ suggestion.matchReason }}
              </span>
            </div>
          </div>
          <div class="suggestion-actions">
            <button class="action-button add" @click="sendRequest(suggestion.id)">Anfragen</button>
            <button class="action-button ignore" @click="ignoreSuggestion(suggestion.id)">Ignorieren</button>
          </div>
        </div>
      </div>
      
      <!-- Leerer Zustand für Empfehlungen -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>Keine Empfehlungen vorhanden</h3>
        <p>Derzeit gibt es keine Freundschaftsempfehlungen für dich.</p>
        <button class="reset-button invite-button" @click="showInviteModal = true">
          <span class="invite-icon">✉️</span>
          Freunde einladen
        </button>
      </div>
    </div>
    
    <!-- Einladungs-Modal -->
    <div v-if="showInviteModal" class="modal-backdrop" @click="showInviteModal = false">
      <div class="modal-content" @click.stop>
        <h3>Freunde einladen</h3>
        <p>Lade Freunde ein, der Community beizutreten.</p>
        <div class="invite-form">
          <input type="email" placeholder="E-Mail-Adresse" v-model="inviteEmail" />
          <textarea placeholder="Persönliche Nachricht (optional)" v-model="inviteMessage"></textarea>
          <button class="send-invite-button" @click="sendInvite">Einladung senden</button>
        </div>
        <button class="close-modal" @click="showInviteModal = false">×</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

interface Friend {
  id: number;
  name: string;
  bio: string;
  friendSince: string;
  sharedInterests: number;
  isOnline: boolean;
}

interface FriendRequest {
  id: number;
  name: string;
  message: string;
  requestDate: string;
  mutualFriends: number;
}

interface FriendSuggestion {
  id: number;
  name: string;
  bio: string;
  mutualFriends: number;
  matchReason: string;
}

export default defineComponent({
  name: 'FriendsDashboard',
  setup() {
    // Status
    const activeTab = ref('friends');
    const searchQuery = ref('');
    const activeFriendMenu = ref<number | null>(null);
    const showInviteModal = ref(false);
    const inviteEmail = ref('');
    const inviteMessage = ref('');
    
    // Tabs
    const tabs = ref([
      { id: 'friends', name: 'Meine Freunde' },
      { id: 'requests', name: 'Anfragen' },
      { id: 'suggestions', name: 'Empfehlungen' }
    ]);
    
    // Beispieldaten (später durch API-Daten ersetzen)
    const friends = ref<Friend[]>([
      {
        id: 1,
        name: 'Sarah Müller',
        bio: 'Mutter von zwei Jungs (3 und 6 Jahre). Leidenschaftliche Hobbyköchin und Outdoor-Fan.',
        friendSince: '15.03.2025',
        sharedInterests: 4,
        isOnline: true
      },
      {
        id: 2,
        name: 'Michael Weber',
        bio: 'Vater einer Tochter (4). Software-Entwickler und Fotografie-Enthusiast.',
        friendSince: '02.04.2025',
        sharedInterests: 2,
        isOnline: false
      },
      {
        id: 3,
        name: 'Lisa Becker',
        bio: 'Mutter von Zwillingen (7). Lehrerin und Yoga-Liebhaberin.',
        friendSince: '20.04.2025',
        sharedInterests: 3,
        isOnline: true
      }
    ]);
    
    const pendingRequests = ref<FriendRequest[]>([
      {
        id: 101,
        name: 'Thomas Schmidt',
        message: 'Hallo! Ich habe gesehen, dass wir beide Interesse an Montessori-Pädagogik haben.',
        requestDate: '01.05.2025',
        mutualFriends: 1
      },
      {
        id: 102,
        name: 'Julia Fischer',
        message: '',
        requestDate: '03.05.2025',
        mutualFriends: 0
      }
    ]);
    
    const friendSuggestions = ref<FriendSuggestion[]>([
      {
        id: 201,
        name: 'Markus Wagner',
        bio: 'Vater von zwei Kindern (5 und 8). IT-Berater und Hobbymusiker.',
        mutualFriends: 2,
        matchReason: 'Interesse an Musikerziehung'
      },
      {
        id: 202,
        name: 'Anna Schulz',
        bio: 'Mutter eines Jungen (3). Kinderärztin und Autorin eines Elternblogs.',
        mutualFriends: 0,
        matchReason: 'Interesse an Gesundheit & Ernährung'
      },
      {
        id: 203,
        name: 'Daniel Hoffmann',
        bio: 'Vater von drei Kindern (2, 5, 7). Sportlehrer und Outdoor-Enthusiast.',
        mutualFriends: 1,
        matchReason: 'Interesse an Outdoor-Aktivitäten mit Kindern'
      }
    ]);
    
    // Berechnete Eigenschaften
    const friendsCount = computed(() => friends.value.length);
    const pendingRequestsCount = computed(() => pendingRequests.value.length);
    const suggestionsCount = computed(() => friendSuggestions.value.length);
    
    // Nach Namen gefilterte Freunde
    const filteredFriends = computed(() => {
      if (!searchQuery.value.trim()) return friends.value;
      
      const query = searchQuery.value.toLowerCase();
      return friends.value.filter(friend => 
        friend.name.toLowerCase().includes(query) || 
        friend.bio.toLowerCase().includes(query)
      );
    });
    
    // Such-Handler
    const filterFriends = () => {
      // Aktives Menü zurücksetzen, wenn gesucht wird
      activeFriendMenu.value = null;
    };
    
    // Suche zurücksetzen
    const clearSearch = () => {
      searchQuery.value = '';
    };
    
    // Freundesmenü umschalten
    const toggleFriendMenu = (friendId: number) => {
      activeFriendMenu.value = activeFriendMenu.value === friendId ? null : friendId;
    };
    
    // Initialen für Avatar-Platzhalter
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    };
    
    // Freund entfernen
    const unfriend = (friendId: number) => {
      const index = friends.value.findIndex(friend => friend.id === friendId);
      if (index !== -1) {
        const friendName = friends.value[index].name;
        if (confirm(`Möchtest du die Freundschaft mit ${friendName} wirklich beenden?`)) {
          friends.value.splice(index, 1);
          activeFriendMenu.value = null;
        }
      }
    };
    
    // Anfrage annehmen
    const acceptRequest = (requestId: number) => {
      const request = pendingRequests.value.find(req => req.id === requestId);
      if (request) {
        // Anfrage annehmen und Freund hinzufügen
        friends.value.push({
          id: request.id,
          name: request.name,
          bio: 'Neu hinzugefügter Freund',
          friendSince: new Date().toLocaleDateString('de-DE'),
          sharedInterests: request.mutualFriends,
          isOnline: false
        });
        
        // Anfrage entfernen
        const index = pendingRequests.value.findIndex(req => req.id === requestId);
        if (index !== -1) {
          pendingRequests.value.splice(index, 1);
        }
      }
    };
    
    // Anfrage ablehnen
    const declineRequest = (requestId: number) => {
      const index = pendingRequests.value.findIndex(req => req.id === requestId);
      if (index !== -1) {
        pendingRequests.value.splice(index, 1);
      }
    };
    
    // Anfrage senden
    const sendRequest = (suggestionId: number) => {
      // Empfehlung entfernen (später durch tatsächliche Anfrage-Logik ersetzen)
      const index = friendSuggestions.value.findIndex(sug => sug.id === suggestionId);
      if (index !== -1) {
        const suggestion = friendSuggestions.value[index];
        
        alert(`Freundschaftsanfrage an ${suggestion.name} wurde gesendet!`);
        
        friendSuggestions.value.splice(index, 1);
      }
    };
    
    // Empfehlung ignorieren
    const ignoreSuggestion = (suggestionId: number) => {
      const index = friendSuggestions.value.findIndex(sug => sug.id === suggestionId);
      if (index !== -1) {
        friendSuggestions.value.splice(index, 1);
      }
    };
    
    // Einladung senden
    const sendInvite = () => {
      if (inviteEmail.value.trim()) {
        alert(`Einladung an ${inviteEmail.value} wurde gesendet!`);
        inviteEmail.value = '';
        inviteMessage.value = '';
        showInviteModal.value = false;
      }
    };
    
    return {
      activeTab,
      searchQuery,
      activeFriendMenu,
      showInviteModal,
      inviteEmail,
      inviteMessage,
      tabs,
      friends,
      pendingRequests,
      friendSuggestions,
      friendsCount,
      pendingRequestsCount,
      suggestionsCount,
      filteredFriends,
      filterFriends,
      clearSearch,
      toggleFriendMenu,
      getInitials,
      unfriend,
      acceptRequest,
      declineRequest,
      sendRequest,
      ignoreSuggestion,
      sendInvite
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/style/base/variables' as vars;
@use '@/style/base/mixins' as mixins;
@use '@/style/base/animations' as animations;

.friends-dashboard {
  @include animations.fade-in(0.5s);
  display: flex;
  flex-direction: column;
  gap: map.get(vars.$spacing, l);
  
  .page-header {
    margin-bottom: map.get(vars.$spacing, l);
    
    h2 {
      font-size: map.get(map.get(vars.$fonts, sizes), xxl);
      font-weight: map.get(map.get(vars.$fonts, weights), extra-bold);
      margin-bottom: map.get(vars.$spacing, xs);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
  }
  
  // Statistik-Karten
  .friends-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: map.get(vars.$spacing, l);
    margin-bottom: map.get(vars.$spacing, l);
    
    .stat-card {
      display: flex;
      align-items: center;
      padding: map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), medium);
      transition: all 0.3s;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          border: 1px solid mixins.theme-color($theme, border-light);
          
          &:hover {
            transform: translateY(-5px);
            @include mixins.shadow('medium', $theme);
          }
        }
      }
      
      .stat-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: map.get(vars.$spacing, m);
        font-size: 1.5rem;
      }
      
      .stat-info {
        h3 {
          font-size: map.get(map.get(vars.$fonts, sizes), xl);
          font-weight: map.get(map.get(vars.$fonts, weights), bold);
          margin: 0 0 map.get(vars.$spacing, xxs) 0;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
        
        p {
          margin: 0;
          font-size: map.get(map.get(vars.$fonts, sizes), small);
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              color: mixins.theme-color($theme, text-secondary);
            }
          }
        }
      }
    }
  }
  
  // Tabs
  .friends-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: map.get(vars.$spacing, s);
    margin-bottom: map.get(vars.$spacing, l);
    
    .tab-button {
      padding: map.get(vars.$spacing, s) map.get(vars.$spacing, l);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-size: map.get(map.get(vars.$fonts, sizes), small);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          color: mixins.theme-color($theme, text-secondary);
          
          &:hover {
            background-color: mixins.theme-color($theme, hover-color);
          }
          
          &.active {
            background: mixins.theme-gradient($theme, primary);
            color: white;
          }
        }
      }
    }
  }
  
  // Suchleiste
  .search-section {
    margin-bottom: map.get(vars.$spacing, l);
    
    .search-container {
      position: relative;
      width: 100%;
      
      input {
        width: 100%;
        padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl) map.get(vars.$spacing, m) map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            @include mixins.form-element($theme);
          }
        }
      }
      
      .search-button {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
    }
  }
  
  // Gemeinsame Stile für Cards
  .friends-grid, .requests-grid, .suggestions-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: map.get(vars.$spacing, l); // Adjusted spacing for better alignment
    
    @media (max-width: 768px) {
      justify-content: center; // Center align cards on smaller screens
    }
  }
  
  // Card-Styles
  .friend-card, .request-card, .suggestion-card {
    width: 600px;
    display: flex;
    padding: map.get(vars.$spacing, l);
    border-radius: map.get(map.get(vars.$layout, border-radius), medium);
    position: relative;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    gap: map.get(vars.$spacing, m);
    overflow: hidden;
    
    @each $theme in ('light', 'dark') {
      .theme-#{$theme} & {
        background-color: mixins.theme-color($theme, card-bg);
        border: 1px solid mixins.theme-color($theme, border-light);
        
        &:hover {
          transform: translateY(-4px);
          @include mixins.shadow('medium', $theme);
          border-color: mixins.theme-color($theme, border-medium);
        }
      }
    }
    
    // Avatar-Stil
    .friend-avatar, .request-avatar, .suggestion-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      flex-shrink: 0;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, secondary-bg);
          border: 2px solid mixins.theme-color($theme, accent-green);
        }
      }
      
      .avatar-placeholder {
        font-size: 2rem;
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .online-indicator {
        position: absolute;
        bottom: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background-color: #4CAF50; // Grün für Online
        border: 2px solid white;
      }
    }
    
    // Info-Bereich
    .friend-info, .request-info, .suggestion-info {
      flex: 1;
      min-width: 0; // Für Textbegrenzung
      
      h3 {
        margin: 0 0 map.get(vars.$spacing, xs) 0;
        font-size: map.get(map.get(vars.$fonts, sizes), large);
        font-weight: map.get(map.get(vars.$fonts, weights), bold);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      .friend-bio, .request-message, .suggestion-bio {
        margin-bottom: map.get(vars.$spacing, s);
        font-size: map.get(map.get(vars.$fonts, sizes), medium);
        line-height: 1.4;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .friend-meta, .request-meta, .suggestion-meta {
        display: flex;
        flex-wrap: wrap;
        gap: map.get(vars.$spacing, s);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-tertiary);
          }
        }
        
        .friend-since, .request-date, .mutual-friends, .match-reason, .shared-interests {
          padding: 4px 10px;
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          white-space: nowrap;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
            }
          }
        }
      }
    }
    
    // Aktionen
    .friend-actions, .request-actions, .suggestion-actions {
      display: flex;
      gap: map.get(vars.$spacing, s);
      align-items: flex-start;
      
      .request-actions, .suggestion-actions {
        flex-direction: column;
      }
      
      .action-button {
        padding: map.get(vars.$spacing, xs) map.get(vars.$spacing, m);
        border-radius: map.get(map.get(vars.$layout, border-radius), pill);
        font-size: map.get(map.get(vars.$fonts, sizes), small);
        font-weight: map.get(map.get(vars.$fonts, weights), medium);
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        
        &.message {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                @include mixins.shadow('small', $theme);
              }
            }
          }
        }
        
        &.more {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          font-size: 18px;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, secondary-bg);
              color: mixins.theme-color($theme, text-secondary);
              
              &:hover {
                background-color: mixins.theme-color($theme, hover-color);
              }
            }
          }
        }
        
        &.accept {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-green);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                @include mixins.shadow('small', $theme);
              }
            }
          }
        }
        
        &.decline, &.ignore {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: transparent;
              color: #ff6b6b; // Rot für Ablehnen
              border: 1px solid rgba(255, 107, 107, 0.3);
              
              &:hover {
                background-color: rgba(255, 107, 107, 0.1);
                border-color: rgba(255, 107, 107, 0.5);
              }
            }
          }
        }
        
        &.add {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: mixins.theme-color($theme, accent-teal);
              color: white;
              
              &:hover {
                transform: translateY(-2px);
                @include mixins.shadow('small', $theme);
              }
            }
          }
        }
      }
      
      // Freunde-Menü
      .friend-menu {
        position: absolute;
        top: 50px;
        right: 20px;
        z-index: 10;
        border-radius: map.get(map.get(vars.$layout, border-radius), medium);
        overflow: hidden;
        @include mixins.shadow('medium', 'light');
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: mixins.theme-color($theme, card-bg);
            border: 1px solid mixins.theme-color($theme, border-light);
          }
        }
        
        button {
          width: 100%;
          padding: map.get(vars.$spacing, m);
          text-align: left;
          border: none;
          cursor: pointer;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background-color: transparent;
              color: #ff6b6b; // Rot für Löschen
              
              &:hover {
                background-color: rgba(255, 107, 107, 0.1);
              }
            }
          }
        }
      }
    }
  }
  
  // Leerer Zustand
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: map.get(vars.$spacing, xxl);
    text-align: center;
    
    .empty-icon {
      font-size: 4rem;
      margin-bottom: map.get(vars.$spacing, l);
      opacity: 0.5;
    }
    
    h3 {
      font-size: map.get(map.get(vars.$fonts, sizes), xl);
      margin-bottom: map.get(vars.$spacing, m);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-primary);
        }
      }
    }
    
    p {
      font-size: map.get(map.get(vars.$fonts, sizes), medium);
      margin-bottom: map.get(vars.$spacing, l);
      max-width: 500px;
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          color: mixins.theme-color($theme, text-secondary);
        }
      }
    }
    
    .reset-button {
      padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), pill);
      font-weight: map.get(map.get(vars.$fonts, weights), medium);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: map.get(vars.$spacing, s);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background: mixins.theme-gradient($theme, primary);
          color: white;
          
          &:hover {
            transform: translateY(-3px);
            @include mixins.shadow('medium', $theme);
          }
        }
      }
      
      .invite-icon {
        font-size: 1.2rem;
      }
    }
  }
  
  // Modal-Hintergrund
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .modal-content {
      width: 90%;
      max-width: 500px;
      padding: map.get(vars.$spacing, xl);
      border-radius: map.get(map.get(vars.$layout, border-radius), large);
      position: relative;
      @include animations.fade-in(0.3s);
      
      @each $theme in ('light', 'dark') {
        .theme-#{$theme} & {
          background-color: mixins.theme-color($theme, card-bg);
          @include mixins.shadow('large', $theme);
        }
      }
      
      h3 {
        font-size: map.get(map.get(vars.$fonts, sizes), xl);
        margin-bottom: map.get(vars.$spacing, m);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-primary);
          }
        }
      }
      
      p {
        margin-bottom: map.get(vars.$spacing, l);
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            color: mixins.theme-color($theme, text-secondary);
          }
        }
      }
      
      .invite-form {
        display: flex;
        flex-direction: column;
        gap: map.get(vars.$spacing, m);
        
        input, textarea {
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              @include mixins.form-element($theme);
            }
          }
        }
        
        textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .send-invite-button {
          align-self: flex-end;
          padding: map.get(vars.$spacing, m) map.get(vars.$spacing, xl);
          border-radius: map.get(map.get(vars.$layout, border-radius), pill);
          font-weight: map.get(map.get(vars.$fonts, weights), medium);
          border: none;
          cursor: pointer;
          
          @each $theme in ('light', 'dark') {
            .theme-#{$theme} & {
              background: mixins.theme-gradient($theme, primary);
              color: white;
              
              &:hover {
                transform: translateY(-3px);
                @include mixins.shadow('medium', $theme);
              }
            }
          }
        }
      }
      
      .close-modal {
        position: absolute;
        top: 15px;
        right: 15px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        border: none;
        
        @each $theme in ('light', 'dark') {
          .theme-#{$theme} & {
            background-color: transparent;
            color: mixins.theme-color($theme, text-secondary);
            
            &:hover {
              color: mixins.theme-color($theme, text-primary);
            }
          }
        }
      }
    }
  }
}
</style>