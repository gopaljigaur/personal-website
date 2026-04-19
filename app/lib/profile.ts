import profileData from 'content/profile.json'

export const profile = {
  name: profileData.name,
  title: profileData.title,
  location: profileData.location,
  role: profileData.role,
  workplace: profileData.workplace,
  workplaceUrl: profileData.workplaceUrl,
  bio: profileData.bio,
  contact: {
    email: profileData.email,
    github: profileData.github,
    linkedin: profileData.linkedin,
    resume: profileData.resume,
  },
}

export const profileText = `${profile.name} is a ${profile.title} based in ${profile.location}. Currently working as ${profile.role} at ${profile.workplace} (${profile.workplaceUrl}). ${profile.bio}`
