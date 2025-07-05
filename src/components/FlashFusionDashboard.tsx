import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  Zap, 
  TrendingUp, 
  Shield, 
  MapPin,
  Store,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3
} from "lucide-react";

const FlashFusionDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">FlashFusion</h1>
                <p className="text-sm text-muted-foreground">E-Commerce Control Core</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-fusion-success text-fusion-success">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time to Launch</CardTitle>
              <Clock className="h-4 w-4 text-fusion-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">1.2 hrs</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-fusion-success">↓ 40% faster</span> than target
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sync Accuracy</CardTitle>
              <BarChart3 className="h-4 w-4 text-fusion-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">99.8%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-fusion-success">↑ 0.3%</span> vs last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-fusion-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">+127%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-fusion-accent">Post-adoption</span> vs pre-adoption
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/40 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">CAC/AOV Ratio</CardTitle>
              <DollarSign className="h-4 w-4 text-fusion-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12.3%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-fusion-success">↓ 23%</span> industry avg
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Agent Control Center */}
          <Card className="lg:col-span-2 bg-gradient-card border-border/40 shadow-elevated">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-fusion-primary" />
                <CardTitle className="text-foreground">Agent Control Center</CardTitle>
              </div>
              <CardDescription>AI-powered automation workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Onboarding Agent</h4>
                    <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Auto-detects platforms, imports products, configures sync settings</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="text-fusion-success font-medium">96.2%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Error Detection Agent</h4>
                    <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30">Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Monitors API failures, inventory mismatches, payment issues</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="text-fusion-primary font-medium">&lt; 30s</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Risk Prediction Agent</h4>
                    <Badge className="bg-fusion-warning/20 text-fusion-warning border-fusion-warning/30">Training</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Predicts policy changes, fee adjustments, platform risks</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="text-fusion-warning font-medium">87.4%</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">Sales Optimization Agent</h4>
                    <Badge className="bg-fusion-secondary/20 text-fusion-secondary border-fusion-secondary/30">Beta</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Optimizes pricing, inventory, marketing campaigns</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ROI Impact</span>
                    <span className="text-fusion-secondary font-medium">+34%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Monitor */}
          <Card className="bg-gradient-card border-border/40 shadow-elevated">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-fusion-warning" />
                <CardTitle className="text-foreground">Risk Monitor</CardTitle>
              </div>
              <CardDescription>AI threat detection & alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-fusion-success mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Payment Systems</p>
                    <p className="text-xs text-muted-foreground">All processors operational</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-fusion-warning mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Policy Changes</p>
                    <p className="text-xs text-muted-foreground">Etsy fee increase detected (2 days)</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-fusion-success mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">API Health</p>
                    <p className="text-xs text-muted-foreground">All integrations stable</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-fusion-primary mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Inventory Sync</p>
                    <p className="text-xs text-muted-foreground">99.8% accuracy maintained</p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full border-fusion-warning/30 text-fusion-warning hover:bg-fusion-warning/10">
                View All Alerts
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Integration Matrix */}
        <Card className="bg-gradient-card border-border/40 shadow-elevated">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-fusion-accent" />
              <CardTitle className="text-foreground">Integration Matrix</CardTitle>
            </div>
            <CardDescription>Connected platforms and sync status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Shopify */}
              <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-fusion-success/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-fusion-success" />
                  </div>
                  <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30 text-xs">Connected</Badge>
                </div>
                <h4 className="font-medium text-foreground mb-1">Shopify</h4>
                <p className="text-xs text-muted-foreground mb-2">OAuth • Products, Orders, Inventory</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sync:</span>
                    <span className="text-fusion-success">5min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-fusion-success">Healthy</span>
                  </div>
                </div>
              </div>

              {/* Etsy */}
              <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-fusion-primary/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-fusion-primary" />
                  </div>
                  <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30 text-xs">Connected</Badge>
                </div>
                <h4 className="font-medium text-foreground mb-1">Etsy</h4>
                <p className="text-xs text-muted-foreground mb-2">OAuth • Orders, Listings</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sync:</span>
                    <span className="text-fusion-primary">10min</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-fusion-success">Healthy</span>
                  </div>
                </div>
              </div>

              {/* TikTok Shop */}
              <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-fusion-secondary/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-fusion-secondary" />
                  </div>
                  <Badge className="bg-fusion-warning/20 text-fusion-warning border-fusion-warning/30 text-xs">Pending</Badge>
                </div>
                <h4 className="font-medium text-foreground mb-1">TikTok Shop</h4>
                <p className="text-xs text-muted-foreground mb-2">OAuth • Products, Orders</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sync:</span>
                    <span className="text-muted-foreground">--</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-fusion-warning">Setup Required</span>
                  </div>
                </div>
              </div>

              {/* Stripe */}
              <div className="p-4 rounded-lg border border-border/40 bg-background/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded bg-fusion-accent/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-fusion-accent" />
                  </div>
                  <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30 text-xs">Connected</Badge>
                </div>
                <h4 className="font-medium text-foreground mb-1">Stripe</h4>
                <p className="text-xs text-muted-foreground mb-2">API Key • Payments, Subscriptions</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sync:</span>
                    <span className="text-fusion-accent">Real-time</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-fusion-success">Healthy</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Roadmap */}
        <Card className="bg-gradient-card border-border/40 shadow-elevated">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-fusion-secondary" />
              <CardTitle className="text-foreground">Implementation Roadmap</CardTitle>
            </div>
            <CardDescription>Feature rollout and success metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Phase 1 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-fusion-success"></div>
                    <h4 className="font-medium text-foreground">Phase 1: Core Foundation</h4>
                  </div>
                  <Badge className="bg-fusion-success/20 text-fusion-success border-fusion-success/30">Completed</Badge>
                </div>
                <div className="ml-6 space-y-2">
                  <Progress value={100} className="h-2" />
                  <p className="text-sm text-muted-foreground">Core integrations, onboarding agent, basic error detection</p>
                  <div className="flex space-x-4 text-xs text-muted-foreground">
                    <span>✓ Shopify & Etsy integrations</span>
                    <span>✓ Onboarding automation</span>
                    <span>✓ Error monitoring</span>
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-fusion-primary"></div>
                    <h4 className="font-medium text-foreground">Phase 2: Intelligence Layer</h4>
                  </div>
                  <Badge className="bg-fusion-primary/20 text-fusion-primary border-fusion-primary/30">In Progress</Badge>
                </div>
                <div className="ml-6 space-y-2">
                  <Progress value={67} className="h-2" />
                  <p className="text-sm text-muted-foreground">Advanced analytics, risk prediction, multi-channel optimization</p>
                  <div className="flex space-x-4 text-xs text-muted-foreground">
                    <span>✓ Risk prediction agent</span>
                    <span>🔄 Sales optimization</span>
                    <span>⏳ TikTok Shop integration</span>
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-border"></div>
                    <h4 className="font-medium text-foreground">Phase 3: Scale & Expansion</h4>
                  </div>
                  <Badge variant="outline">Planned</Badge>
                </div>
                <div className="ml-6 space-y-2">
                  <Progress value={0} className="h-2" />
                  <p className="text-sm text-muted-foreground">Wholesale marketplace, custom AI marketing, global expansion</p>
                  <div className="flex space-x-4 text-xs text-muted-foreground">
                    <span>⏳ Wholesale integration</span>
                    <span>⏳ AI marketing agent</span>
                    <span>⏳ Global marketplace</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FlashFusionDashboard;