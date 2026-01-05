# Abwaan Docs

A clean, consolidated set of project docs. This replaces the scattered top-level reports.

## Index
- `docs/PROJECT_OVERVIEW.md` - Purpose, audience, core features, and tech stack.
- `docs/STATUS.md` - Current state of the product (what works vs what is missing).
- `docs/ROADMAP.md` - Prioritized next steps and longer-term features.
- `docs/MODERATION_PLAN.md` - Admin/moderation architecture and policy plan.
- `docs/SEARCH.md` - Current search behavior, gaps, and future improvements.
- `docs/UX_AUDIT.md` - UX/UI audit findings and remaining work.
- `docs/RUNBOOK.md` - Local dev + preview deployment instructions.
- `docs/STATUS_BOARD.md` - Public-facing narrative status board draft.



    <div class="bg-gray-50/95 backdrop-blur-md border-b border-gray-200 relative z-50">
      <div class="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between">
        <div
          class="flex items-stretch w-full md:w-auto overflow-x-auto no-scrollbar border-b md:border-b-0 border-gray-200"
        >
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-8 py-5 text-xs font-bold uppercase tracking-widest transition-colors border-r border-gray-200 whitespace-nowrap hover:bg-gray-50"
            :class="
              activeTab === tab.key
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'text-gray-500 hover:text-carrotOrange-600'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex items-center w-full md:w-auto divide-x divide-gray-200 border-b md:border-b-0 border-gray-200">
          <BaseDropdown
            v-model="activeLanguage"
            :options="languages"
            label="LANG"
            class="px-8 py-5 text-xs font-bold uppercase tracking-widest transition-colors border-r border-gray-200 whitespace-nowrap hover:bg-gray-50 text-gray-500 hover:text-carrotOrange-600"
          />
          <BaseDropdown
            v-model="sortBy"
            :options="sortOptions"
            label="SORT"
            class="px-8 py-5 text-xs font-bold uppercase tracking-widest transition-colors border-r border-gray-200 whitespace-nowrap hover:bg-gray-50 text-gray-500 hover:text-carrotOrange-600"
          />
        </div>
      </div>
    </div>