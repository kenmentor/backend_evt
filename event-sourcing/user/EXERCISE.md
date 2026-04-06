# Exercise: Convert User Module to Event Sourcing

## Your Task

Convert the User module from your existing code to use event sourcing.

### Starting Point

Your current user schema has:
- email, password, userName, phoneNumber
- verifiedEmail, verifiedNIN, adminVerified
- role, rank, verificationCompleted
- profileImage, lastLogin, pioneer

### Step 1: Define Events

What are all the things that can happen to a user?

```ts
// events/user.ts
export type UserEvt =
  | { type: 'registered'; email: string; userName: string; phoneNumber: string }
  | { type: 'emailVerified' }
  | { type: 'ninVerified' }
  | { type: 'adminVerified' }
  | { type: 'profileImageUpdated'; imageUrl: string }
  | { type: 'loggedIn' }
  | { type: 'roleChanged'; role: string }
  | { type: 'rankChanged'; rank: number }
  | { type: 'pioneerGranted' }
  | { type: 'disabled' }
  | { type: 'deleted' }
```

### Step 2: Define Aggregate State

What state does a user have at any point in time?

```ts
export type UserAgg = {
  email: string
  userName: string
  phoneNumber: string
  profileImage: string
  verifiedEmail: boolean
  verifiedNIN: boolean
  adminVerified: boolean
  role: string
  rank: number
  verificationCompleted: boolean
  lastLogin: Date | null
  pioneer: boolean
  disabled: boolean
}
```

### Step 3: Implement the Aggregate

Create `aggregate/user.ts`:

```ts
import { createAggregate } from '../../evtstore/src/create-aggregate'
import { UserEvt, UserAgg } from '../events/user'

export const user = createAggregate<UserEvt, UserAgg, 'user-events'>({
  stream: 'user-events',
  create: () => ({
    email: '',
    userName: '',
    phoneNumber: '',
    profileImage: '',
    verifiedEmail: false,
    verifiedNIN: false,
    adminVerified: false,
    role: 'USER',
    rank: 1,
    verificationCompleted: false,
    lastLogin: null,
    pioneer: false,
    disabled: false,
  }),
  fold: (evt) => {
    switch (evt.type) {
      case 'registered':
        return { email: evt.email, userName: evt.userName, phoneNumber: evt.phoneNumber }
      case 'emailVerified':
        return { verifiedEmail: true }
      case 'ninVerified':
        return { verifiedNIN: true, verificationCompleted: true }
      case 'adminVerified':
        return { adminVerified: true }
      case 'profileImageUpdated':
        return { profileImage: evt.imageUrl }
      case 'loggedIn':
        return { lastLogin: new Date() }
      case 'roleChanged':
        return { role: evt.role }
      case 'rankChanged':
        return { rank: evt.rank }
      case 'pioneerGranted':
        return { pioneer: true }
      case 'disabled':
        return { disabled: true }
      case 'deleted':
        return { disabled: true }
    }
  },
})
```

### Step 4: Implement Commands

Create `commands/user.ts`:

```ts
import { createCommands } from '../../evtstore/src/create-command'
import { domain } from '../domain'
import { UserAgg, UserCmd, UserEvt } from '../events/user'

export const userCmd = createCommands<UserEvt, UserAgg, UserCmd>(domain.user, {
  register: async (cmd, agg) => {
    if (agg.version > 0) throw new Error('User already exists')
    return {
      type: 'registered',
      email: cmd.email,
      userName: cmd.userName,
      phoneNumber: cmd.phoneNumber,
    }
  },

  verifyEmail: async (_cmd, agg) => {
    if (agg.verifiedEmail) return
    return { type: 'emailVerified' }
  },

  verifyNIN: async (_cmd, agg) => {
    if (agg.verifiedNIN) return
    return { type: 'ninVerified' }
  },

  adminVerify: async (_cmd, agg) => {
    if (agg.adminVerified) return
    return { type: 'adminVerified' }
  },

  login: async (_cmd, agg) => {
    if (agg.disabled) throw new Error('User is disabled')
    return { type: 'loggedIn' }
  },

  updateProfileImage: async (cmd, agg) => {
    if (agg.profileImage === cmd.imageUrl) return
    return { type: 'profileImageUpdated', imageUrl: cmd.imageUrl }
  },

  changeRole: async (cmd, agg) => {
    if (agg.role === cmd.role) return
    return { type: 'roleChanged', role: cmd.role }
  },

  disable: async (_cmd, agg) => {
    if (agg.disabled) return
    return { type: 'disabled' }
  },
})
```

### Step 5: Create Domain

Create `domain.ts`:

```ts
import { createProvider } from '../../evtstore/provider/memory'
import { createDomainV2 } from '../../evtstore/src/domain-v2'
import { user } from './aggregate/user'

export const provider = createProvider<any>()
export const { domain } = createDomainV2({ provider }, { user })
```

### Step 6: Test It

Create `test.js`:

```js
const { userCmd } = require('./commands/user')

async function test() {
  const userId = 'user-123'

  // Register
  await userCmd.register(userId, {
    email: 'test@example.com',
    userName: 'TestUser',
    phoneNumber: '08012345678',
  })

  // Get current state
  const state = await domain.user.getAggregate(userId)
  console.log('After registration:', state.state)

  // Verify email
  await userCmd.verifyEmail(userId, undefined)

  // Login
  await userCmd.login(userId, undefined)

  // Check final state
  const final = await domain.user.getAggregate(userId)
  console.log('After login:', final.state)
}

test()
```

## Run It

```bash
cd event-sourcing
npx ts-node user/test.js
```

## Your Assignment

1. Add the missing commands from your current user-service.js:
   - `forgot_password` (token generation)
   - `reset_password`
   - `edit_user_details`

2. Think about:
   - How do you handle password hashing?
   - How do you maintain the "forgot password" token?
   - What events should be emitted for password changes?

3. Advanced: Create a read model that queries all verified users.
