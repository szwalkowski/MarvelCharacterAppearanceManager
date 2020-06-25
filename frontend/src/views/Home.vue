<template>
  <div>
    <h2>Welcome to Marvel Character Appearance Manager!</h2>
    <p>
      Application is supposed to help you with reading Marvel Comics when
      focusing certain characters.
    </p>
    <p>
      Filter comics by those you read and appearance type if don't want to waste
      time by minor appearances.
    </p>
    <p>
      Data is based on
      <a href="https://marvel.fandom.com/wiki">Marvel Database</a>
      wiki content.
    </p>
    <p>All new issues should be added automatically every once in a while.</p>
    <p>
      If you find something not updated or missing character or any bug, please
      <a href="mailto: app.mcam@gmail.com">contact me!</a>
    </p>
    <p>
      You can also write issue directly on
      <a
        href="https://github.com/Sarseth/MarvelCharacterAppearanceManager/issues"
      >
        github.
      </a>
      There is as well road map for this project. Welcome to contribute!
    </p>
    <h4 class="text-warning">Important note</h4>
    <p class="text-warning">
      This is 'dry-run'.<br />
      It's hosted using free tier on Heroku - that means it has limited
      availability. <br />
      Hosting might change and as well the address. But I will do my best to
      migrate your comics data history. <br />
      I am looking for patreons/donations that is needed for hosting (host
      'always on' and have DB with backups), domain and maintenance costs.
      <br />
      <router-link tag="button" class="btn btn-warning" to="/donation">
        Want to donate or offer help? Click here
      </router-link>
    </p>
  </div>
</template>
