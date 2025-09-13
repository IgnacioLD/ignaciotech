# Modern Developer Portfolio Hugo Theme

A clean, modern Hugo theme for developers and engineers to showcase their work and share their knowledge. Features a fully customizable hero section, responsive design, and dark mode support.

## Features

- 🎨 **Modern Design**: Clean, centered layout with smooth animations
- 📱 **Fully Responsive**: Works perfectly on all devices
- 🌙 **Dark Mode**: System preference detection with manual toggle
- ⚡ **Fast & Lightweight**: Optimized for performance
- 🔧 **Highly Customizable**: Configure everything through markdown frontmatter
- 📝 **Blog Ready**: Built-in blog with categories and tags
- 💼 **Project Showcase**: Dedicated project pages and portfolio
- 🔍 **SEO Optimized**: Proper meta tags and structured data

## Quick Start

1. **Install the theme**:
   ```bash
   git submodule add https://github.com/your-username/modern-dev-portfolio.git themes/modern-dev-portfolio
   ```

2. **Configure your site**:
   - Update `hugo.toml` with your information
   - Customize the hero section in `content/_index.md`
   - Add your projects and blog posts

3. **Run your site**:
   ```bash
   hugo server
   ```

## Configuration

### Site Configuration (`hugo.toml`)

```toml
# Basic site info
baseURL = 'https://yoursite.com'
theme = 'modern-dev-portfolio'

[params]
  author = "Your Name"
  description = "Your professional tagline"
  location = "Your Location" # Optional

# Social links (all optional)
[params.social]
  linkedin = "https://linkedin.com/in/your-profile"
  github = "https://github.com/your-username"  
  email = "your-email@example.com"
  mastodon = "https://mastodon.social/@your-handle"
  x = "https://x.com/your-handle"
```

### Hero Section (`content/_index.md`)

The hero section is fully customizable through frontmatter:

```yaml
---
title: "Your Name - Your Title"
description: "Your SEO description"

# Hero Section Configuration
hero:
  greeting: "Hello!"
  introduction: "Your introduction paragraph"
  mission: "Your mission statement"
  approach: "Your approach description"
  
  # Navigation Links
  navigation:
    title: "Explore"
    description: "To learn more, you can check out my"
    links:
      - name: "projects"
        url: "/projects/"
      - name: "blog"
        url: "/blog/"
      - name: "about"
        url: "/about/"
  
  # Social Section
  social:
    title: "Connect"
    closing_message: "Thanks for visiting!"
    signature: "- Your Name"
    show_icons: true
  
  # Portrait Image
  portrait:
    src: "/your-photo.jpg"
    alt: "Your Name"
    show: true

# Layout Settings
layout:
  style: "minimal" # Options: "minimal" or "split"
  show_portrait: true
  max_width: "1100px"
---

<!-- Optional additional content appears below the hero -->
```

## Layout Options

### Minimal Layout (Default)
- Centered design
- Portrait below content on mobile, side-by-side on desktop
- Clean, focused presentation

### Split Layout
- Content on left, portrait on right (desktop)
- Left-aligned text
- More traditional layout

## Customization

### Colors & Styling

The theme uses CSS custom properties for easy customization. Override these in your CSS:

```css
:root {
  --primary-color: #0066CC;
  --text-color: #1a1a1a;
  --text-secondary: #666;
  --bg-color: #ffffff;
  --surface-color: #f8f9fa;
  --border-color: #e1e5e9;
}
```

### Typography

The theme uses system fonts by default but can be easily customized by updating the font imports in the head partial.

## Adding Content

### Blog Posts
Create markdown files in `content/blog/`:

```yaml
---
title: "Your Blog Post"
date: 2024-01-15
categories: ["Category1", "Category2"]
tags: ["tag1", "tag2"]
featured: true # Shows in featured section
---

Your blog content here...
```

### Projects  
Create markdown files in `content/projects/`:

```yaml
---
title: "Your Project"
date: 2024-01-15
image: "/images/project.jpg"
description: "Project description"
tech: ["Technology1", "Technology2"]
links:
  - name: "Live Demo"
    url: "https://demo.example.com"
  - name: "Source Code"
    url: "https://github.com/user/repo"
---

Your project details...
```

## License

This theme is released under the MIT License. See LICENSE file for details.

## Support

If you have questions or need help customizing the theme:

1. Check the documentation
2. Look at the example content
3. Open an issue on GitHub

## Credits

Built with ❤️ using Hugo static site generator.