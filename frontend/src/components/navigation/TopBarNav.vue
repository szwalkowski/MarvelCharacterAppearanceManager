<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary pl-sm-4">
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav mr-auto">
        <li class="nav-item">
          <router-link tag="a" class="nav-link" to="/add-new-character">
            Add new character
          </router-link>
        </li>
        <li class="nav-item">
          <router-link tag="a" class="nav-link" to="/dictionary?type=focusType">
            Dictionary for focus types
          </router-link>
        </li>
        <li class="nav-item">
          <router-link
            tag="a"
            class="nav-link"
            to="/dictionary?type=appearanceType"
          >
            Dictionary for appearances
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>
