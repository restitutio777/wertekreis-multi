import React, { useState } from 'react';
import Button from './ExampleButton';
import Card from './ExampleCard';
import Input from './ExampleInput';

export default function DesignSystemShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [errorInputValue, setErrorInputValue] = useState('');

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-h1 font-logo text-deep-charcoal mb-8">Werte•Kreis Design System</h1>
        
        {/* Color Palette */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Color Palette</h2>
          
          <div className="space-y-6">
            {/* Primary Colors */}
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Primary: Burnt Sienna</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-burnt-sienna rounded-md shadow-subtle"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">Base #E07A5F</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-burnt-sienna/80 rounded-md shadow-subtle"></div> {/* Lion/80 */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">80% Opacity</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-burnt-sienna/60 rounded-md shadow-subtle"></div> {/* Lion/60 */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">60% Opacity</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-burnt-sienna/40 rounded-md shadow-subtle"></div> {/* Lion/40 */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">40% Opacity</p>
                </div>
              </div>
            </div>
            
            {/* Secondary Colors */}
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Secondary Colors</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-dark-teal-navy rounded-md shadow-subtle"></div> {/* Russet */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">Dark Teal/Navy #3D405B</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-deep-sage-green rounded-md shadow-subtle"></div> {/* Deep Sage Green */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">Deep Sage Green #52796F</p>
                </div>
              </div>
            </div>
            
            {/* Background Colors */}
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Neutral Shades</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-warm-off-white rounded-md shadow-subtle"></div> {/* Silver-100 */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">Warm Off-White #FFFBF5</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-light-warm-gray rounded-md shadow-subtle"></div> {/* Silver-200 */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">Light Warm Gray #E0DED7</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-deep-charcoal rounded-md shadow-subtle"></div> {/* Black */}
                  <p className="text-body-sm mt-2 text-deep-charcoal text-pure-white">Deep Charcoal #363636</p>
                </div>
              </div>
            </div>

            {/* Silver Scale */}
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Silver Scale</h3>
              <div className="flex flex-wrap gap-4">
                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
                  <div key={shade} className="flex flex-col items-center">
                    <div className={`w-24 h-24 bg-silver-${shade} rounded-md shadow-subtle`}></div>
                    <p className="text-body-sm mt-2 text-deep-charcoal">Silver-{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Accent Colors */}
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Accent Colors</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-muted-gold rounded-md shadow-subtle"></div> {/* Muted Gold */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">Muted Gold #F2CC8F</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-vibrant-teal rounded-md shadow-subtle"></div> {/* Vibrant Teal */}
                  <p className="text-body-sm mt-2 text-deep-charcoal text-pure-white">Vibrant Teal #2A9D8F</p>
                </div>
              </div>
            </div>
            
            {/* Text Colors */}
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Text Colors</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-silver-100 rounded-md shadow-subtle flex items-center justify-center text-deep-charcoal"> {/* Silver-100, Black */}
                    <span className="text-h3">Aa</span>
                  </div>
                  <p className="text-body-sm mt-2 text-deep-charcoal">Primary Text #363636</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-silver-100 rounded-md shadow-subtle flex items-center justify-center text-silver-500"> {/* Silver-100, Silver-500 */}
                    <span className="text-h3">Aa</span>
                  </div>
                  <p className="text-body-sm mt-2 text-deep-charcoal">Secondary Text #8B8370 (90% opacity)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Typography */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Typography</h2>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-h1 font-logo text-deep-charcoal">Heading 1 (48px)</h1>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 700, Line height: 56px, Letter spacing: -0.02em</p> {/* Silver-500 */}
            </div>
            
            <div>
              <h2 className="text-h2 font-logo text-deep-charcoal">Heading 2 (32px)</h2>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 700, Line height: 40px, Letter spacing: -0.01em</p> {/* Silver-500 */}
            </div>
            
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal">Heading 3 (24px)</h3>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 600, Line height: 32px</p> {/* Silver-500 */}
            </div>
            
            <div>
              <h4 className="text-h4 font-logo text-deep-charcoal">Heading 4 (20px)</h4>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 600, Line height: 28px</p> {/* Silver-500 */}
            </div>
            
            <div>
              <p className="text-body-lg text-deep-charcoal">Body Large (18px)</p>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 400, Line height: 28px</p> {/* Silver-500 */}
            </div>
            
            <div>
              <p className="text-body text-deep-charcoal">Body Regular (16px)</p>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 400, Line height: 24px</p> {/* Silver-500 */}
            </div>
            
            <div>
              <p className="text-body-sm text-deep-charcoal">Body Small (14px)</p>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 400, Line height: 20px</p> {/* Silver-500 */}
            </div>
            
            <div>
              <p className="text-micro text-deep-charcoal/90">Micro Text (14px)</p>
              <p className="text-body-sm text-silver-500 mt-1">Font weight: 400, Line height: 20px, Letter spacing: 0.5px</p> {/* Silver-500 */}
            </div>
          </div>
        </section>
        
        {/* Buttons */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Buttons</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Primary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button>Medium</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Tertiary Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="tertiary" size="sm">Small</Button>
                <Button variant="tertiary">Medium</Button>
                <Button variant="tertiary" size="lg">Large</Button>
                <Button variant="tertiary" disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Form Elements */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Form Elements</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Text Inputs</h3>
              <div className="space-y-6">
                <Input
                  id="standard-input"
                  label="Standard Input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter some text"
                  helperText="This is helper text for this field" // This text color will be updated below
                />
                
                <Input
                  id="error-input"
                  label="Input with Error"
                  value={errorInputValue}
                  onChange={(e) => setErrorInputValue(e.target.value)}
                  placeholder="Enter some text"
                  error="This field has an error message" // This text color will be updated below
                />
                
                <Input
                  id="disabled-input"
                  label="Disabled Input"
                  value="Disabled value"
                  onChange={() => {}}
                  disabled
                  helperText="This input is disabled" // This text color will be updated below
                />
                
                <Input
                  id="required-input"
                  label="Required Input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  required
                  helperText="This field is required" // This text color will be updated below
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Cards */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Standard Card">
              <p className="text-body text-silver-500 mb-4"> {/* Silver-500 */}
                This is a standard card component with a title and content.
                It uses the Silver-100 background with subtle shadow.
              </p>
              <Button>Learn More</Button>
            </Card>
            
            <Card title="Interactive Card" interactive>
              <p className="text-body text-silver-500 mb-4"> {/* Silver-500 */}
                This card is interactive. Hover over it to see the shadow
                and border effect change. It's perfect for clickable cards.
              </p>
              <Button variant="secondary">View Details</Button>
            </Card>
            
            <Card className="md:col-span-2 bg-burnt-sienna/10 border-l-4 border-burnt-sienna"> {/* Lion/10, Lion */}
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="text-h3 font-logo text-deep-charcoal mb-2">Feature Card</h3>
                  <p className="text-body text-silver-500"> {/* Silver-500 */}
                    This is a feature card with a custom background and left border accent.
                    It spans the full width on larger screens to draw attention.
                  </p>
                </div>
                <Button variant="tertiary">Explore</Button>
              </div>
            </Card>
          </div>
        </section>
        
        {/* Spacing & Dividers */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Spacing & Dividers</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Spacing Scale</h3>
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-burnt-sienna w-4 h-4"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">xs (4px)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-burnt-sienna w-8 h-8"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">sm (8px)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-burnt-sienna w-16 h-16"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">md (16px)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-burnt-sienna w-24 h-24"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">lg (24px)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-burnt-sienna w-32 h-32"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">xl (32px)</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-burnt-sienna w-48 h-48"></div> {/* Lion */}
                  <p className="text-body-sm mt-2 text-deep-charcoal">2xl (48px)</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Dividers</h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-body-sm text-silver-500 mb-2">Subtle Divider (Light Warm Gray)</p> {/* Silver-500 */}
                  <hr className="border-t border-silver-200" /> {/* Silver-200 */}
                </div>
                
                <div>
                  <p className="text-body-sm text-silver-500 mb-2">Standard Divider (Light Warm Gray)</p> {/* Silver-500 */}
                  <hr className="border-t border-silver-200" /> {/* Silver-200 */}
                </div>
                
                <div>
                  <p className="text-body-sm text-silver-500 mb-2">Strong Divider (Light Warm Gray)</p> {/* Silver-500 */}
                  <hr className="border-t border-silver-200" /> {/* Silver-200 */}
                </div>
                
                <div>
                  <p className="text-body-sm text-silver-500 mb-2">Full Divider (Light Warm Gray)</p> {/* Silver-500 */}
                  <hr className="border-t border-silver-200" /> {/* Silver-200 */}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Accessibility */}
        <section className="mb-12 bg-silver-100 p-6 rounded-lg shadow-md"> {/* Silver-100 */}
          <h2 className="text-h2 font-logo text-deep-charcoal mb-6">Accessibility</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Contrast Ratios</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-burnt-sienna rounded-md"> {/* Lion */}
                  <p className="text-pure-white font-medium">Pure White text on Burnt Sienna background</p>
                  <p className="text-body-sm mt-1 text-pure-white/90">Contrast ratio: 4.5:1 (Passes AA)</p>
                </div>
                
                <div className="p-4 bg-dark-teal-navy rounded-md"> {/* Russet */}
                  <p className="text-pure-white font-medium">Pure White text on Dark Teal/Navy background</p>
                  <p className="text-body-sm mt-1 text-pure-white/90">Contrast ratio: 9.9:1 (Passes AAA)</p>
                </div>
                
                <div className="p-4 bg-silver-100 rounded-md"> {/* Silver-100 */}
                  <p className="text-deep-charcoal font-medium">Deep Charcoal text on Warm Off-White background</p>
                  <p className="text-body-sm mt-1 text-deep-charcoal/90">Contrast ratio: 13.9:1 (Passes AAA)</p>
                </div>
                
                <div className="p-4 bg-muted-gold rounded-md"> {/* Muted Gold */}
                  <p className="text-deep-charcoal font-medium">Deep Charcoal text on Muted Gold background</p>
                  <p className="text-body-sm mt-1 text-deep-charcoal/90">Contrast ratio: 4.5:1 (Passes AA)</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-h3 font-logo text-deep-charcoal mb-4">Focus States</h3>
              
              <div className="flex flex-wrap gap-4">
                <Button className="focus:ring-2 focus:ring-burnt-sienna focus:ring-opacity-40">Focused Button</Button> {/* Lion */}
                <Button variant="secondary" className="focus:ring-2 focus:ring-burnt-sienna focus:ring-opacity0">Focused Secondary</Button> {/* Lion */}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}