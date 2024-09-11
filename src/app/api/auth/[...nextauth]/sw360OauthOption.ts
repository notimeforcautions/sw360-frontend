// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { SW360User } from '../../../../../nextauth'
import crypto from 'crypto';
import { SW360_API_URL, SW360_REST_CLIENT_ID, SW360_REST_CLIENT_SECRET } from '@/utils/env';
import { NextAuthOptions } from 'next-auth';

let codeVerifier: crypto.BinaryLike;

const sw360OauthOption: NextAuthOptions = {
  providers: [
    {
      id: "sw360-backend",
      name: "sw360 backend",
      type: "oauth",
      version: "2.0",
      wellKnown: SW360_API_URL + "/authorization/.well-known/oauth-authorization-server",
      checks: ["pkce", "state"],
      idToken: true,
      // Partial GH Copilot generated- start
      authorization: {
        params: {
          scope: "openid READ WRITE ADMIN", code_challenge_method: "S256", code_challenge: (() => {
            codeVerifier = codeVerifierGenerator();
            const codeChallenge = codeChallengeGenerator(codeVerifier);
            return codeChallenge;
          })(),
        }
      },
      // Partial GH Copilot generated- end
      clientId: SW360_REST_CLIENT_ID,
      clientSecret: SW360_REST_CLIENT_SECRET,
      profile: async (profiles, tokens) => {
        return {
          exp: tokens.exp,
          expires_in: tokens.expires_in,
          iat: tokens.iat,
          refresh_token: tokens.refresh_token,
          scope: tokens.scope,
          token_type: tokens.token_type,
          userGroup: profiles.userGroup,
          email: profiles.email,
          access_token: 'Bearer ' + tokens.access_token,
          id: profiles.sub,
        } as SW360User;
      },
    }
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user }
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = token
      return session
    },
  },

  pages: {
    signIn: '/',
  },
}

// GH Copilot generated- start
function codeVerifierGenerator() {
  const randomBytes = crypto.randomBytes(32);
  const verifier = base64urlEncode(randomBytes);
  return verifier;
}

function base64urlEncode(buffer: Buffer) {
  return buffer.toString('base64')
    .replace('+', '-')
    .replace('/', '_')
    .replace(/=+$/, '');
}


function codeChallengeGenerator(verifier: crypto.BinaryLike) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  const challenge = base64urlEncode(hash);
  return challenge;
}
// GH Copilot generated- end

export default sw360OauthOption;