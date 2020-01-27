<template>
  <div>
    <div class="issue-filter-div actions actions_top">
      <form id="issue-filter-form">
        <h4>Filter issues:</h4><br />
        <div>
          <label for="read-status-dropdown" class="label-filter-grouper">
            Read:
          </label>
          <select id="read-status-dropdown" v-model="selectedReadStatus">
            <option v-for="status in readStatuses" :key="status">
              {{ status }}
            </option>
          </select>
        </div>
        <div>
          <label class="label-filter-grouper">Show for focus type:</label>
          <input type="checkbox" id="feature-character-check" checked="checked">
          <label for="feature-character-check">Featured Character</label>&nbsp;
          <input type="checkbox" id="antagonist-check" checked="checked">
          <label for="antagonist-check">Antagonist</label>&nbsp;
          <input type="checkbox" id="supporting-character-check" checked="checked">
          <label for="supporting-character-check">Supporting Character</label>&nbsp;
          <input type="checkbox" id="other-character-check" checked="checked">
          <label for="other-character-check">Other</label>
        </div>
        <div>
          <label class="label-filter-grouper">Appearance types: </label>
          <input type="checkbox" id="-hide-appearance-type-check" class="checkbox-for-appearance-type" checked="checked">
          <label for="-hide-appearance-type-check">Empty</label>&nbsp;
          <!--
          {{#each setOfAppearanceTypes}}
          <input type="checkbox" id="{{spacesToUnderscores this}}-appearance-type-check" class="checkbox-for-appearance-type" checked="checked">
          <label for="{{spacesToUnderscores this}}-appearance-type-check">{{this}}</label>&nbsp;
          {{/each}}
          -->
        </div>
      </form>
    </div>
    <section flex flex-full-center id="issues-landing-container">
      <table>
        <thead>
          <tr>
            <th>Issue name:</th>
            <th>Publication date:</th>
            <th>Volume:</th>
            <th>Issue no:</th>
            <th>Stories:</th>
            <th>Read:</th>
          </tr>
        </thead>
        <tbody>
          <!--
          {{#each characterData.issues}}
          <tr class="issue-row" data-focus-type="{{resolveFocusTypes appearances}}" data-appearance-type="{{resolveAppearanceTypes appearances}}"
              data-issue-id="{{id}}" data-read="{{read}}">
            <td><a href="{{url}}">{{name}}</a></td>
            <td>{{timestampToDate publishDateTimestamp}}</td>
            <td>{{volume}}</td>
            <td>{{issueNo}}</td>
            <td>
              <table class="small-table">
                <thead>
                  <tr>
                    <th>title</th>
                    <th>focus type</th>
                    <th>appearance type</th>
                  </tr>
                </thead>
                <tbody>
                  {{#each appearances}}
                  <tr>
                    <td>{{subtitle}}</td>
                    <td>{{focusType}}</td>
                    <td>{{appearanceTypes}}</td>
                  </tr>
                  {{/each}}
                </tbody>
              </table>
            </td>
            <td class="read-issue-cell">
              <label class="read-time-label" {{#unless read}}hidden="hidden" {{/unless}}>{{timestampToTime read}}</label>
              <button class="remove-read-issue-button" value="{{id}}" {{#unless read}}hidden="hidden" {{
              /unless}}>x</button>
              <button class="read-issue-button" value="{{id}}" {{#if read}}hidden="hidden" {{
              /if}}>Read!</button>
            </td>
          </tr>
          {{/each}}
          -->
        </tbody>
      </table>
    </section>
    <div class="character-manager actions actions_top">
      <div class="nav">
        <label for="alias-text-input">Alias: </label><input type="text" id="alias-text-input" :value="alias">
        <button type="button" id="rename-alias-button">Rename visible alias</button>
        <button type="button" id="update-character-button">Update character</button>
        <button type="button" id="remove-character-action">Remove character</button>
      </div>
    </div>
  </div>
</template>
<script>
const setOfAppearanceTypes = [];

export default {
  data() {
    return {
      readStatuses: ["All", "Read", "Not read"],
      selectedReadStatus: "All",
      alias: ""
    };
  }
};
</script>
