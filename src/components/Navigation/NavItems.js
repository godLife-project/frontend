export const navItems = [
  { 
    label: '홈', 
    href: '/' 
  },
  { 
    label: '루틴',
    href: '/routine',
    submenu: [
      { label: '루틴 만들기', href: '/routine/create' },
      { label: '루틴 목록', href: '/routine/list' },
      { label: '인기 루틴', href: '/routine/popular' }
    ]
  },
  { 
    label: '챌린지',
    href: '/team',
    submenu: [
      { label: '나의 챌린지', href: '/team/find' },
      { label: '챌린지 탐색', href: '/team/my' },
    ]
  },
  { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
  // { label: '루틴배틀', href: '/stats' },
]